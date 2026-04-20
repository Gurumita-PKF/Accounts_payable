import { useDropzone } from "react-dropzone";
import { Upload, FileText, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  file: File;
}

interface Props {
  files: UploadedFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onExtract: () => void;
  processing: boolean;
  hasApiKey: boolean;
}

export const UploadZone = ({ files, onAdd, onRemove, onExtract, processing, hasApiKey }: Props) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onAdd,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-smooth",
          "bg-gradient-to-b from-accent/30 to-transparent",
          isDragActive
            ? "border-primary bg-accent/60 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-accent/20"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center shadow-elegant">
            <Upload className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {isDragActive ? "Drop invoices here" : "Drag & drop invoices here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse · PDF, JPG, PNG, WEBP
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">
              {files.length} file{files.length > 1 ? "s" : ""} ready
            </p>
            <Button
              onClick={onExtract}
              disabled={processing || !hasApiKey}
              className="gradient-primary text-primary-foreground hover:opacity-90"
            >
              {processing ? "Extracting..." : "Extract All"}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 rounded-lg border bg-background p-2 group"
              >
                {f.file.type.startsWith("image/") ? (
                  <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                )}
                <span className="text-sm truncate flex-1" title={f.file.name}>
                  {f.file.name}
                </span>
                <button
                  onClick={() => onRemove(f.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {!hasApiKey && (
        <p className="text-sm text-warning text-center">
          ⚠️ Please set your Gemini API key in settings to extract invoices.
        </p>
      )}
    </div>
  );
};
