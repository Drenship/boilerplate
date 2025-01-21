import { useEffect, useRef, useState } from "react";

export function useMessageScroll(messages: any[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    setIsNearBottom(scrollBottom < 100);
  };

  useEffect(() => {
    if (isNearBottom) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setHasNewMessage(false);
    } else {
      setHasNewMessage(true);
    }
  }, [messages, isNearBottom]);

  return {
    scrollRef,
    isNearBottom,
    hasNewMessage,
    handleScroll,
  };
}
