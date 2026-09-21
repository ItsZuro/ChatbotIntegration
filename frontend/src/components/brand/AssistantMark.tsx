import { Box, Text } from "@mantine/core";

import { Sparkles } from "lucide-react";

interface AssistantMarkProps {
  size?: number;
}

export function AssistantMark({
  size = 36,
}: AssistantMarkProps) {
  return (
    <Box
      w={size}
      h={size}
      pos="relative"
      style={{
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        borderRadius: Math.round(size * 0.3),
        background:
          "linear-gradient(145deg, #8b5cf6 0%, #6366f1 48%, #2563eb 100%)",
        border:
          "1px solid rgba(255, 255, 255, 0.22)",
        boxShadow:
          "0 10px 30px rgba(99, 102, 241, 0.38)",
        overflow: "hidden",
      }}
    >
      <Box
        pos="absolute"
        inset={0}
        style={{
          background:
            "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.35), transparent 34%)",
          pointerEvents: "none",
        }}
      />

      <Text
        c="white"
        fw={900}
        lh={1}
        style={{
          fontSize: Math.round(size * 0.5),
          letterSpacing: -1,
          textShadow:
            "0 2px 8px rgba(20, 10, 50, 0.35)",
          zIndex: 1,
        }}
      >
        U
      </Text>

      <Sparkles
        size={Math.max(
          9,
          Math.round(size * 0.26),
        )}
        strokeWidth={2.4}
        style={{
          position: "absolute",
          top: Math.round(size * 0.1),
          right: Math.round(size * 0.08),
          color: "rgba(255,255,255,0.95)",
          zIndex: 2,
        }}
      />
    </Box>
  );
}
