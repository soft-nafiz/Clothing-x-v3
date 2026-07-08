"use client";

import { useCallback, useEffect, useRef } from "react";
import { Bold, Italic, Underline, Strikethrough, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Code, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Lightweight rich text editor using contentEditable + document.execCommand.
 * No external dependencies — works reliably in all browsers.
 * Outputs HTML.
 */
export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const current = editorRef.current.innerHTML;
      if (current !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) exec("createLink", url);
  }, [exec]);

  const ToolButton = ({ icon: Icon, command, value, title }: { icon: any; command: string; value?: string; title: string }) => (
    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => exec(command, value)} title={title} tabIndex={-1}>
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="rich-text-editor overflow-hidden rounded-md border border-input bg-background">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1">
        <ToolButton icon={Bold} command="bold" title="Bold" />
        <ToolButton icon={Italic} command="italic" title="Italic" />
        <ToolButton icon={Underline} command="underline" title="Underline" />
        <ToolButton icon={Strikethrough} command="strikeThrough" title="Strikethrough" />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <ToolButton icon={Heading2} command="formatBlock" value="<h2>" title="Heading 2" />
        <ToolButton icon={Heading3} command="formatBlock" value="<h3>" title="Heading 3" />
        <ToolButton icon={Code} command="formatBlock" value="<p>" title="Paragraph" />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <ToolButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        <ToolButton icon={Quote} command="formatBlock" value="<blockquote>" title="Quote" />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleLink} title="Insert Link" tabIndex={-1}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => exec("removeFormat")} title="Clear Formatting" tabIndex={-1}>
          <Undo2 className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder ?? "Write product description..."}
        className={cn(
          "prose prose-invert rte-editor min-h-[140px] max-w-none p-3 text-sm leading-relaxed",
          "focus:outline-none",
          "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3",
          "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3",
          "[&_p]:mb-2 [&_p]:leading-relaxed",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
          "[&_a]:text-primary [&_a]:underline"
        )}
      />
    </div>
  );
}
