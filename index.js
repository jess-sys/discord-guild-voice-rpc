import { log } from '@cumcord/utils/logger'
import { addHandler } from '@cumcord/websocket'
import { FluxDispatcher } from "@cumcord/modules/common"

const selectVoiceChannel = findByProps("selectVoiceChannel")

function joinGuildVoiceChannel(guildId, channelId) {
    FluxDispatcher.dispatch({
        type: "VOICE_CHANNEL_SELECT",
        channelId: channelId,
        guildId: guildId
      });
}

function leaveGuildVoiceChannel(guildId, channelId) {
    selectVoiceChannel.disconnect();
}

function toggleMute(guildId, channelId) {
    FluxDispatcher.dispatch({
        type: "AUDIO_TOGGLE_SELF_MUTE",
        context: "default",
        syncRemote: true
      });
}

function handlerGuildVoiceChannel(msg, {raw, ok, error}) {
    let targetHandler = null;
    log(`[RPC VOICE CHANNEL PLUGIN] New RPC command received`);

    if (!("action" in msg) || ("action" in msg && msg.action == "")) {
        return error;
    }

    if (!("mode" in msg) || ("mode" in msg && msg.mode == "")) {
        return error;
    }

    if (msg.mode === "JOIN") {
        targetHandler = joinGuildVoiceChannel;
    } else if (msg.mode === "LEAVE") {
        targetHandler = leaveGuildVoiceChannel;
    } else if (msg.mode === "MUTE_TOGGLE") {
        toggleMute();
        return ok;
    }

    if (targetHandler == null) {
        return error;
    }

    if (("guild_id" in msg && "channel_id" in msg) && (msg.guild_id !== "" && msg.channel_id !== "")) {
        log(`[RPC VOICE CHANNEL PLUGIN] Joining guild/channel: ${msg.guild_id}/${msg.channel_id}`);
        targetHandler(msg.guild_id, msg.channel_id);
        return ok;
    } else {
        return error;
    }
}

export default {
  onLoad() {
    addHandler("GUILD_VOICE_CHANNEL", handlerGuildVoiceChannel)
    log("[RPC VOICE CHANNEL PLUGIN] Loaded");

  },
  onUnload() {
    
    log("[RPC VOICE CHANNEL PLUGIN] Unloaded");
  }
};