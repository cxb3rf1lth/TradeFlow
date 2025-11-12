import { useState, useRef, DragEvent } from "react";
import { Upload, X, File, FileText, Image, Video, Music, Archive, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  className?: string;
}

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function FileUpload({
  onUpload,
  accept,
  maxSize = 50,
  multiple = true,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    const imageExts = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"];
    const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "mkv"];
    const audioExts = ["mp3", "wav", "ogg", "m4a", "flac"];
    const archiveExts = ["zip", "rar", "7z", "tar", "gz"];
    const documentExts = ["doc", "docx", "pdf", "txt", "rtf"];

    if (ext && imageExts.includes(ext)) return <Image className="w-6 h-6" />;
    if (ext && videoExts.includes(ext)) return <Video className="w-6 h-6" />;
    if (ext && audioExts.includes(ext)) return <Music className="w-6 h-6" />;
    if (ext && archiveExts.includes(ext)) return <Archive className="w-6 h-6" />;
    if (ext && documentExts.includes(ext)) return <FileText className="w-6 h-6" />;

    return <File className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSize}MB`;
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
      const fileType = file.type;

      const isAccepted = acceptedTypes.some((acceptedType) => {
        if (acceptedType.startsWith(".")) {
          return fileExt === acceptedType;
        }
        if (acceptedType.includes("*")) {
          const baseType = acceptedType.split("/")[0];
          return fileType.startsWith(baseType);
        }
        return fileType === acceptedType;
      });

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesToUpload = multiple ? Array.from(files) : [files[0]];
    const newUploadFiles: UploadFile[] = [];

    for (const file of filesToUpload) {
      const error = validateFile(file);
      newUploadFiles.push({
        file,
        progress: 0,
        status: error ? "error" : "pending",
        error,
      });
    }

    setUploadFiles((prev) => [...prev, ...newUploadFiles]);

    // Upload valid files
    const validFiles = newUploadFiles.filter((uf) => !uf.error).map((uf) => uf.file);
    if (validFiles.length > 0) {
      try {
        // Update status to uploading
        setUploadFiles((prev) =>
          prev.map((uf) =>
            validFiles.includes(uf.file) ? { ...uf, status: "uploading" } : uf
          )
        );

        // Simulate progress (in real implementation, this would track actual upload progress)
        const progressInterval = setInterval(() => {
          setUploadFiles((prev) =>
            prev.map((uf) =>
              uf.status === "uploading" && uf.progress < 90
                ? { ...uf, progress: uf.progress + 10 }
                : uf
            )
          );
        }, 200);

        // Perform the actual upload
        await onUpload(validFiles);

        clearInterval(progressInterval);

        // Mark as success
        setUploadFiles((prev) =>
          prev.map((uf) =>
            validFiles.includes(uf.file)
              ? { ...uf, status: "success", progress: 100 }
              : uf
          )
        );
      } catch (error: any) {
        // Mark as error
        setUploadFiles((prev) =>
          prev.map((uf) =>
            validFiles.includes(uf.file)
              ? { ...uf, status: "error", error: error.message || "Upload failed" }
              : uf
          )
        );
      }
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadFiles([]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        )}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
              isDragging ? "bg-blue-100" : "bg-gray-100"
            )}
          >
            <Upload
              className={cn(
                "w-8 h-8 transition-colors",
                isDragging ? "text-blue-600" : "text-gray-400"
              )}
            />
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {isDragging ? "Drop files here" : "Upload files"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop files here, or click to browse
          </p>

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            Browse Files
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="mt-4 text-xs text-gray-500">
            {accept && <p>Accepted formats: {accept}</p>}
            <p>Maximum file size: {maxSize}MB</p>
          </div>
        </div>
      </div>

      {/* File list */}
      {uploadFiles.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              Files ({uploadFiles.length})
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-3">
            {uploadFiles.map((uploadFile, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    uploadFile.status === "success" && "bg-green-100 text-green-600",
                    uploadFile.status === "error" && "bg-red-100 text-red-600",
                    uploadFile.status === "uploading" && "bg-blue-100 text-blue-600",
                    uploadFile.status === "pending" && "bg-gray-100 text-gray-600"
                  )}
                >
                  {uploadFile.status === "success" && (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                  {uploadFile.status === "error" && <AlertCircle className="w-6 h-6" />}
                  {(uploadFile.status === "uploading" ||
                    uploadFile.status === "pending") &&
                    getFileIcon(uploadFile.file.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    {formatFileSize(uploadFile.file.size)}
                  </p>

                  {uploadFile.status === "uploading" && (
                    <Progress value={uploadFile.progress} className="h-1" />
                  )}

                  {uploadFile.status === "error" && (
                    <p className="text-xs text-red-600">{uploadFile.error}</p>
                  )}

                  {uploadFile.status === "success" && (
                    <p className="text-xs text-green-600">Upload complete</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
