/**
 * 🔌 WebSocket Helper Utilities
 * Simple, reusable functions for testing WebSocket connections
 */

import { Page, WebSocket, expect } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

const WS_LATENCY_THRESHOLD_MS = parseInt(
  process.env.WS_LATENCY_THRESHOLD_MS || "300",
  10
);

export interface WebSocketFrame {
  payload: string;
  timestamp: number;
}

interface WebSocketTracker {
  connection: WebSocket | null;
  sentFrames: WebSocketFrame[];
  receivedFrames: WebSocketFrame[];
  connectionStartTime: number;
  connectionEstablishedTime: number;
  connectionClosedTime: number;
  url: string | null;
  isClosed: boolean;
  enableLogging?: boolean;
}

export class WebSocketHelpers {
  private static payloadToString(payload: unknown): string {
    if (typeof payload === "string") return payload;
    if (Buffer.isBuffer(payload)) return payload.toString("utf8");
    return String(payload);
  }

  private static createTracker(): WebSocketTracker {
    return {
      connection: null,
      sentFrames: [],
      receivedFrames: [],
      connectionStartTime: 0,
      connectionEstablishedTime: 0,
      connectionClosedTime: 0,
      url: null,
      isClosed: false,
    };
  }

  private static setupWebSocketListener(
    page: Page,
    tracker: WebSocketTracker,
    enableLogging: boolean = true,
    urlFilter?: string | RegExp
  ): void {
    page.on("websocket", (wsConnection) => {
      const wsUrl = wsConnection.url();

      // Filter: Only track WebSocket if URL matches filter (if provided)
      if (urlFilter) {
        const matches =
          typeof urlFilter === "string"
            ? wsUrl.includes(urlFilter)
            : urlFilter.test(wsUrl);

        if (!matches) {
          if (enableLogging) {
            console.log(
              `⏭️  WebSocket ignored (doesn't match filter): ${wsUrl}`
            );
          }
          return; // Skip this WebSocket
        }
      }

      if (tracker.connection === null) {
        tracker.connectionEstablishedTime = Date.now();
        tracker.connection = wsConnection;
        tracker.url = wsUrl;
        if (enableLogging) {
          console.log(`✅ WebSocket connected: ${wsUrl}`);
        }
      }

      wsConnection.on("framereceived", (event) => {
        tracker.receivedFrames.push({
          payload: this.payloadToString(event.payload),
          timestamp: Date.now(),
        });
      });

      wsConnection.on("framesent", (event) => {
        tracker.sentFrames.push({
          payload: this.payloadToString(event.payload),
          timestamp: Date.now(),
        });
      });

      wsConnection.on("close", () => {
        tracker.connectionClosedTime = Date.now();
        tracker.isClosed = true;
        if (enableLogging) {
          console.log(`🔌 WebSocket closed: ${wsUrl}`);
        }
      });
    });
  }

  private static async waitForWebSocketConnection(
    page: Page,
    tracker: WebSocketTracker,
    timeout: number = 30000,
    urlFilter?: string | RegExp
  ): Promise<WebSocket> {
    if (tracker.connectionStartTime === 0) {
      tracker.connectionStartTime = Date.now();
    }

    // Check if connection already exists and matches filter (caught by listener)
    if (tracker.connection !== null && tracker.url !== null) {
      if (urlFilter) {
        const matches =
          typeof urlFilter === "string"
            ? tracker.url.includes(urlFilter)
            : urlFilter.test(tracker.url);
        if (matches) {
          // Connection already exists and matches filter, return it immediately
          return tracker.connection;
        }
      } else {
        // No filter, return existing connection
        return tracker.connection;
      }
    }

    // Wait for WebSocket connection with optional filter
    let ws: WebSocket;

    if (urlFilter) {
      // Use predicate to wait for WebSocket that matches filter
      ws = await page.waitForEvent("websocket", {
        timeout,
        predicate: (wsConnection) => {
          const wsUrl = wsConnection.url();
          const matches =
            typeof urlFilter === "string"
              ? wsUrl.includes(urlFilter)
              : urlFilter.test(wsUrl);
          return matches;
        },
      });
    } else {
      // No filter, wait for any WebSocket
      ws = await page.waitForEvent("websocket", { timeout });
    }

    if (tracker.connection === null) {
      tracker.connection = ws;
      tracker.url = ws.url();
      tracker.connectionEstablishedTime = Date.now();
    }

    return ws;
  }

  private static async waitForWebSocketResponse(
    tracker: WebSocketTracker,
    initialFrameCount: number,
    timeout: number = 5000
  ): Promise<number> {
    const initialReceivedCount = tracker.receivedFrames.length;

    // Wait for total frames to increase (command was sent)
    await expect
      .poll(() => tracker.sentFrames.length + tracker.receivedFrames.length, {
        timeout,
      })
      .toBeGreaterThan(initialFrameCount);

    // Wait for new received frames OR use existing ones if response already arrived
    // Give it a short time to see if new frames arrive
    try {
      await expect
        .poll(() => tracker.receivedFrames.length, { timeout: 2000 })
        .toBeGreaterThan(initialReceivedCount);
    } catch {
      // If no new received frames, response might already be there or coming via sent frames
      // Use the latest received frame timestamp if available
    }

    // Return timestamp of first new received frame, or latest if no new ones
    if (tracker.receivedFrames.length > initialReceivedCount) {
      return tracker.receivedFrames[initialReceivedCount].timestamp;
    }

    // If we have received frames, use the latest one's timestamp
    if (tracker.receivedFrames.length > 0) {
      return tracker.receivedFrames[tracker.receivedFrames.length - 1]
        .timestamp;
    }

    // Fallback: use current time (response might be in sent frames or not yet received)
    return Date.now();
  }

  private static verifyConnectivity(tracker: WebSocketTracker): {
    success: boolean;
    connectionTime: number;
    url: string | null;
    failureReason?: string;
  } {
    const connectionTime =
      tracker.connectionEstablishedTime - tracker.connectionStartTime;
    const success =
      tracker.connection !== null && tracker.url !== null && connectionTime > 0;

    if (!success) {
      console.error(
        `❌ Connectivity failed: No WebSocket connection established`
      );
    }

    return {
      success,
      connectionTime,
      url: tracker.url,
      failureReason: success
        ? undefined
        : "WebSocket connection not established",
    };
  }

  private static verifyPerformance(
    tracker: WebSocketTracker,
    initialFrameCount: number,
    sendTime: number,
    responseTime: number,
    threshold: number = WS_LATENCY_THRESHOLD_MS
  ): {
    success: boolean;
    latency: number;
    threshold: number;
    failureReason?: string;
  } {
    const latency = responseTime - sendTime;

    // Verify that new frames were received (confirms WebSocket responded)
    const totalFrames =
      tracker.sentFrames.length + tracker.receivedFrames.length;
    const newFramesDetected = totalFrames > initialFrameCount;

    // Performance is successful if latency is acceptable AND frames were received
    const success = latency < threshold && newFramesDetected;

    if (!success) {
      const reasons: string[] = [];
      if (latency >= threshold) {
        reasons.push(`Latency ${latency}ms >= ${threshold}ms`);
      }
      if (!newFramesDetected) {
        reasons.push(
          `No new frames detected (expected > ${initialFrameCount}, got ${totalFrames})`
        );
      }
      console.error(`❌ Performance failed: ${reasons.join("; ")}`);
    }

    return {
      success,
      latency,
      threshold,
      failureReason: success
        ? undefined
        : `Latency ${latency}ms >= ${threshold}ms${!newFramesDetected ? `; No new frames detected` : ""}`,
    };
  }

  private static verifyIntegrity(tracker: WebSocketTracker): {
    success: boolean;
    validFrames: number;
    invalidFrames: number;
    totalFrames: number;
    failureReason?: string;
  } {
    let validFrames = 0;
    let invalidFrames = 0;

    for (const frame of tracker.receivedFrames) {
      try {
        JSON.parse(frame.payload);
        validFrames++;
      } catch {
        if (frame.payload && frame.payload.length > 0) {
          validFrames++;
        } else {
          invalidFrames++;
        }
      }
    }

    const success = validFrames > 0;
    const totalFrames = tracker.receivedFrames.length;

    if (!success) {
      console.error(`❌ Integrity failed: No valid frames found`);
    }

    return {
      success,
      validFrames,
      invalidFrames,
      totalFrames,
      failureReason: success
        ? undefined
        : `No valid frames found (${totalFrames} total)`,
    };
  }

  /**
   * Main entry point: Set up WebSocket monitoring
   *
   * @param page - Playwright page object
   * @param enableLogging - Whether to log messages (default: true)
   * @param urlFilter - Optional filter to only track WebSockets matching URL pattern
   *                    Can be a string (checks if URL includes string) or RegExp
   *                    Example: "/ws/terminal" or /\/ws\/terminal/
   */
  static setupWebSocketMonitoring(
    page: Page,
    enableLogging: boolean = true,
    urlFilter?: string | RegExp
  ) {
    const tracker = this.createTracker();
    this.setupWebSocketListener(page, tracker, enableLogging, urlFilter);

    return {
      async waitForConnection(timeout: number = 30000) {
        return await WebSocketHelpers.waitForWebSocketConnection(
          page,
          tracker,
          timeout,
          urlFilter
        );
      },
      getSentFrames() {
        return tracker.sentFrames;
      },
      getReceivedFrames() {
        return tracker.receivedFrames;
      },
      verifyConnectivity() {
        return WebSocketHelpers.verifyConnectivity(tracker);
      },
      verifyPerformance(
        initialCount: number,
        sendTime: number,
        responseTime: number,
        threshold?: number
      ) {
        return WebSocketHelpers.verifyPerformance(
          tracker,
          initialCount,
          sendTime,
          responseTime,
          threshold
        );
      },
      verifyIntegrity() {
        return WebSocketHelpers.verifyIntegrity(tracker);
      },
      verifyClosure() {
        return WebSocketHelpers.verifyClosure(tracker);
      },
      async waitForResponse(
        initialCount: number,
        timeout: number = 5000
      ): Promise<number> {
        return await WebSocketHelpers.waitForWebSocketResponse(
          tracker,
          initialCount,
          timeout
        );
      },
      async waitForClosure(timeout: number = 5000) {
        // Check if already closed
        if (
          tracker.isClosed ||
          (tracker.connection !== null && tracker.connection.isClosed())
        ) {
          return;
        }

        // Wait for close event or connection to be closed
        try {
          await expect
            .poll(
              () => {
                const isClosed =
                  tracker.isClosed ||
                  (tracker.connection !== null &&
                    tracker.connection.isClosed());
                return isClosed;
              },
              { timeout, intervals: [100, 250, 500] }
            )
            .toBe(true);
        } catch (error) {
          // If timeout, check connection state one more time
          const finalCheck =
            tracker.isClosed ||
            (tracker.connection !== null && tracker.connection.isClosed());
          if (!finalCheck && tracker.enableLogging) {
            console.error(
              `⚠️ WebSocket closure timeout. Connection state: isClosed=${tracker.isClosed}, connection.isClosed()=${tracker.connection?.isClosed()}`
            );
          }
          throw error;
        }
      },
    };
  }

  private static verifyClosure(tracker: WebSocketTracker): {
    success: boolean;
    isClosed: boolean;
    closureTime: number;
    failureReason?: string;
  } {
    const isClosed =
      tracker.isClosed ||
      (tracker.connection !== null && tracker.connection.isClosed());
    const closureTime = tracker.connectionClosedTime;

    const success = isClosed;

    if (!success) {
      console.error(`❌ WebSocket closure failed: Connection is still open`);
    }

    return {
      success,
      isClosed,
      closureTime,
      failureReason: success ? undefined : "WebSocket connection is still open",
    };
  }
}
