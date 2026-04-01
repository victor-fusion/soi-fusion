"use client";

import { useState, useTransition } from "react";
import { Box, Text, Group, Avatar } from "@mantine/core";
import { IconSend, IconCornerDownRight } from "@tabler/icons-react";
import type { EntregableComment } from "@/types";
import { addComment, deleteComment } from "../actions";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return Math.floor(hrs / 24) + "d";
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

interface CommentItemProps {
  comment: EntregableComment;
  entregableId: string;
  currentUserId: string;
  isReply?: boolean;
}

function CommentItem({ comment, entregableId, currentUserId, isReply }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();

  const authorName = comment.author?.full_name ?? "Usuario";
  const isAdmin = comment.author?.role === "admin";
  const isOwn = comment.author_id === currentUserId;

  const submitReply = () => {
    const text = replyText.trim();
    if (!text) return;
    startTransition(async () => {
      await addComment(entregableId, text, comment.id);
      setReplyText("");
      setShowReply(false);
    });
  };

  const handleDelete = () => {
    if (!confirm("¿Eliminar este comentario?")) return;
    startTransition(async () => {
      await deleteComment(comment.id, entregableId);
    });
  };

  return (
    <Box style={{ opacity: isPending ? 0.5 : 1, transition: "opacity 0.15s" }}>
      <Group gap={10} align="flex-start">
        <Avatar
          size={isReply ? 26 : 32}
          radius="xl"
          style={{
            backgroundColor: isAdmin ? "#2563eb15" : "#f3f4f6",
            color: isAdmin ? "#2563eb" : "#6b7280",
            fontSize: isReply ? 10 : 12, fontWeight: 700, flexShrink: 0,
          }}
        >
          {initials(authorName)}
        </Avatar>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap={8} mb={4}>
            <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
              {authorName}
            </Text>
            {isAdmin && (
              <Text style={{
                fontSize: 10, fontWeight: 700, color: "#2563eb",
                backgroundColor: "#eff6ff", padding: "1px 6px", borderRadius: 4,
              }}>
                Fusión
              </Text>
            )}
            <Text style={{ fontSize: 11, color: "#d1d5db" }}>
              {timeAgo(comment.created_at)}
            </Text>
          </Group>

          <Text style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
            {comment.body}
          </Text>

          <Group gap={12} mt={6}>
            {!isReply && (
              <button
                onClick={() => setShowReply(!showReply)}
                style={{
                  fontSize: 12, color: "#9ca3af", background: "none",
                  border: "none", cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <IconCornerDownRight size={12} />
                Responder
              </button>
            )}
            {isOwn && (
              <button
                onClick={handleDelete}
                style={{
                  fontSize: 12, color: "#d1d5db", background: "none",
                  border: "none", cursor: "pointer", padding: 0,
                }}
              >
                Eliminar
              </button>
            )}
          </Group>

          {showReply && (
            <Box mt={10} style={{ display: "flex", gap: 8 }}>
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe una respuesta…"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(); } }}
                autoFocus
                style={{
                  flex: 1, fontSize: 13, padding: "7px 12px",
                  borderRadius: 8, border: "1px solid #e5e7eb",
                  outline: "none", fontFamily: "inherit",
                }}
              />
              <button
                onClick={submitReply}
                disabled={isPending || !replyText.trim()}
                style={{
                  padding: "7px 12px", borderRadius: 8,
                  border: "none", backgroundColor: "#111827",
                  color: "#fff", cursor: isPending ? "wait" : "pointer",
                  display: "flex", alignItems: "center",
                  opacity: !replyText.trim() ? 0.4 : 1,
                }}
              >
                <IconSend size={13} />
              </button>
            </Box>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <Box mt={12} style={{ borderLeft: "2px solid #f3f4f6", paddingLeft: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  entregableId={entregableId}
                  currentUserId={currentUserId}
                  isReply
                />
              ))}
            </Box>
          )}
        </Box>
      </Group>
    </Box>
  );
}

interface CommentsSectionProps {
  entregableId: string;
  comments: EntregableComment[];
  currentUserId: string;
}

export function CommentsSection({ entregableId, comments, currentUserId }: CommentsSectionProps) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    const body = text.trim();
    if (!body) return;
    startTransition(async () => {
      await addComment(entregableId, body);
      setText("");
    });
  };

  return (
    <Box>
      <Text style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
        Conversación ({comments.length})
      </Text>

      {comments.length === 0 && (
        <Text style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
          Aún no hay comentarios. Usa este espacio para hablar con el equipo Fusión sobre este entregable.
        </Text>
      )}

      <Box style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            entregableId={entregableId}
            currentUserId={currentUserId}
          />
        ))}
      </Box>

      {/* Input nuevo comentario */}
      <Box style={{ display: "flex", gap: 10 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario o pregunta al equipo Fusión…"
          rows={2}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          style={{
            flex: 1, fontSize: 13, padding: "10px 14px",
            borderRadius: 10, border: "1px solid #e5e7eb",
            outline: "none", resize: "none", fontFamily: "inherit",
            color: "#374151",
          }}
        />
        <button
          onClick={submit}
          disabled={isPending || !text.trim()}
          style={{
            padding: "10px 16px", borderRadius: 10,
            border: "none", backgroundColor: "#111827",
            color: "#fff", cursor: isPending ? "wait" : "pointer",
            display: "flex", alignItems: "center", alignSelf: "flex-end",
            opacity: !text.trim() ? 0.4 : 1,
          }}
        >
          <IconSend size={15} />
        </button>
      </Box>
    </Box>
  );
}
