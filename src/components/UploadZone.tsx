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
          "relative rounded-xl border border-dashed p-6 sm:p-10 text-center cursor-pointer transition-smooth",
          "bg-white",
          isDragActive
            ? "border-blue-500 bg-blue-50/60 scale-[1.01]"
            : "border-[#bed0e5] hover:border-blue-400 hover:bg-blue-50/40"
        )}
      >
        <input {...getInputProps()} />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
            <Upload className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-semibold">
              {isDragActive ? "Drop invoices here" : "Drag & drop invoices here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse · PDF, JPG, PNG, WEBP
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="rounded-xl border border-[#c8d6e8] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <p className="text-sm font-medium">
              {files.length} file{files.length > 1 ? "s" : ""} ready
            </p>
            <Button
              onClick={onExtract}
              disabled={processing || !hasApiKey}
              className="bg-[#2f88db] text-white hover:bg-[#2678c3]"
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
