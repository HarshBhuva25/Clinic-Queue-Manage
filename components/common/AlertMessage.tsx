interface AlertMessageProps {
  kind: "error" | "success";
  message: string | null;
}

export function AlertMessage({ kind, message }: AlertMessageProps) {
  if (!message) {
    return null;
  }

  return <div className={`banner banner-${kind}`}>{message}</div>;
}
