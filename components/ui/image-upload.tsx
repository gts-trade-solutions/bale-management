"use client";

import { useCallback, useState } from "react";
import { Upload, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  accept?: string;
  maxSize?: number;
  required?: boolean;
  description?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  required = false,
  description,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (file.size > maxSize) {
        setError(`File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    },
    [maxSize, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    onChange("");
    setError(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Drop image here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative border rounded-lg p-4 bg-muted/30">
          <div className="flex items-start gap-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-background border">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Image uploaded</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click remove to change image
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => {
                  const win = window.open();
                  if (win) {
                    win.document.write(
                      `<img src="${preview}" style="max-width:100%; height:auto;" />`
                    );
                  }
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
