import Ably, { Realtime, Rest } from "ably";
import type { Message, PaginatedResult } from "ably";
import { env } from "@/env";

class AblyService {
  private realtime: Realtime;
  private rest: Rest;

  constructor(apiKey: string) {
    this.realtime = new Ably.Realtime(apiKey);
    this.rest = new Ably.Rest(apiKey);
  }

  async publish(channelName: string, eventName: string, data: unknown) {
    const channel = this.rest.channels.get(channelName);
    await channel.publish(eventName, data);
  }

  subscribe(
    channelName: string,
    eventName: string | null,
    callback: (message: Message) => void,
  ): () => void {
    const channel = this.realtime.channels.get(channelName);

    if (eventName) {
      channel.subscribe(eventName, callback); // specific event
      return () => channel.unsubscribe(eventName, callback);
    } else {
      channel.subscribe(callback); // all events
      return () => channel.unsubscribe(callback);
    }
  }

  async getHistory(channelName: string, limit = 50): Promise<Message[]> {
    const channel = this.rest.channels.get(channelName);
    const page: PaginatedResult<Message> = await channel.history({ limit });
    return page.items;
  }

  close() {
    this.realtime.close();
  }
}

const ablyService = new AblyService(env.ABLY_API_KEY);
export default ablyService;
