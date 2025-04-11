
import { useEffect, useState } from "react";
import { Upload, File, X, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams } from "react-router-dom";
import { createDocument, deleteDocumentById, getAllDocument } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

type Document = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
};

type DocumentUploaderProps = {
  onUpload: (file: File) => Promise<void>;
  documents: Document[];
  onDelete: (id: string) => Promise<void>;
  buyerId: any;
  documents1:any;
  setDocuments1:any;
  fetchDocuments:any;
  loading:any;
  setLoading:any;
};

type DocumentType = {
  _id: string;
  url: string;
  type: string;
  createdAt: string;
  dealId: { _id: string; title: string };
  buyerId: { _id: string; name: string };
  sellerId: { _id: string; name: string };
};

export function DocumentUploader({ onUpload, documents, onDelete, buyerId,setDocuments1,documents1,fetchDocuments,loading,setLoading }: DocumentUploaderProps) {
  console.log("🚀 ~ DocumentUploader ~ buyerId:", buyerId)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [isDragging, setIsDragging] = useState(false);
  const { id } = useParams<{ id: string }>();
  const delaId = id;
  // const [documents1, setDocuments1] = useState<DocumentType[]>([]);
  // const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);



  // const fetchDocuments = async () => {
  //   try {
  //     if (id && buyerId && currentUser?._id) {
  //       setLoading(true);
  //       const data = await getAllDocument(id, buyerId, currentUser._id);
  //       setDocuments1(data); // data should be the array
  //       console.log("📄 Documents fetched:", data);
  //     } else {
  //       console.log("❌ Missing one or more IDs.");
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.error("🚨 Error fetching documents:", error);
  //     setLoading(false);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  // useEffect(() => {
  //   fetchDocuments();
  // }, [id, buyerId, currentUser?._id]);

  const handleDelete = async (docId: string) => {
    try {
      setDeletingDocId(docId);
      await deleteDocumentById(docId);
      setDocuments1((prev) => prev.filter((doc) => doc._id !== docId));

      toast({
        title: "Deleted",
        description: "The document has been successfully deleted.",
      });
    } catch (error) {
      console.error("❌ Failed to delete document:", error);
      setDeletingDocId(null);
      toast({
        title: "Error",
        description: "Something went wrong while deleting the document.",
        variant: "destructive",
      });
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } } as any);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `${file.name}-${Date.now()}`;
      const ext = file.name.split('.').pop() || 'unknown';

      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', ext);
      formData.append('dealId', delaId);
      formData.append('sellerId', currentUser._id);
      formData.append('buyerId', buyerId);

      try {
        setUploadProgress((prev) => ({ ...prev, [id]: 0 }));

        await createDocument(formData);

        toast({
          title: 'Success',
          description: 'Document uploaded successfully.',
        });

        fetchDocuments(); // refresh list
      } catch (error) {
        console.error('🚨 Upload failed:', error);
        toast({
          title: 'Error',
          description: 'Failed to upload the document.',
          variant: 'destructive',
        });
      } finally {
        setUploadProgress((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      }
    }
  };

  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (files && files.length > 0) {
  //     await uploadFile(files[0]);
  //   }
  // };

  // const uploadFile = async (file: File) => {
  //   const id = Math.random().toString(36).substring(7);
  //   setUploadProgress({ ...uploadProgress, [id]: 0 });

  //   // Simulate upload progress
  //   const interval = setInterval(() => {
  //     setUploadProgress((prev) => {
  //       const newProgress = (prev[id] || 0) + 10;
  //       if (newProgress >= 100) {
  //         clearInterval(interval);
  //       }
  //       return { ...prev, [id]: Math.min(newProgress, 100) };
  //     });
  //   }, 300);

  //   try {
  //     await onUpload(file);
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //   } finally {
  //     // Clean up after upload completes or fails
  //     setTimeout(() => {
  //       setUploadProgress((prev) => {
  //         const newProgress = { ...prev };
  //         delete newProgress[id];
  //         return newProgress;
  //       });
  //     }, 1000);
  //   }
  // };

  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   setIsDragging(true);
  // };

  // const handleDragLeave = () => {
  //   setIsDragging(false);
  // };

  // const handleDrop = async (e: React.DragEvent) => {
  //   e.preventDefault();
  //   setIsDragging(false);
  //   if (e.dataTransfer.files.length > 0) {
  //     await uploadFile(e.dataTransfer.files[0]);
  //   }
  // };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('pdf')) return '📄';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'].some(ext => lowerType.includes(ext))) return '🖼️';
    if (['doc', 'docx', 'word'].some(ext => lowerType.includes(ext))) return '📝';
    if (['xls', 'xlsx'].some(ext => lowerType.includes(ext))) return '📊';
    if (['ppt', 'pptx'].some(ext => lowerType.includes(ext))) return '📽️';
    if (['zip', 'rar', '7z', 'tar', 'gz'].some(ext => lowerType.includes(ext))) return '🗜️';
    if (['mp4', 'mkv', 'mov', 'avi'].some(ext => lowerType.includes(ext))) return '🎬';
    if (['mp3', 'wav', 'ogg'].some(ext => lowerType.includes(ext))) return '🎵';
    if (['txt', 'text', 'rtf'].some(ext => lowerType.includes(ext))) return '📄';

    return '📎'; // default icon
  };


  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:bg-gray-50'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        {Object.keys(uploadProgress).length > 0 ? (
          <div className="flex flex-col items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-2" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">
              Drag & drop files here or click to browse
            </p>
            {/* <p className="text-xs text-gray-500 mt-1">
              Supports PDF, DOCX, PNG, JPG
            </p> */}
          </>
        )}

        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
          onChange={handleFileChange}
        />
      </div>


      {/* Progress UI */}
      {/* {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2 mt-4">
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <div key={id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-xs text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          ))}
        </div>
      )} */}




      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {documents.map((doc) => (
          <div key={doc.id} className="document-card flex items-center">
            <div className="text-2xl mr-3">{getFileIcon(doc.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-gray-500 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div> */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Fetching documents, please wait...</p>
        </div>
      ) : documents1.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {documents1.map((doc) => (
            <div
              key={doc._id}
              className="document-card flex items-center border p-3 rounded-xl shadow-sm hover:bg-gray-50 transition"
            >
              <div className="text-2xl mr-3">{getFileIcon(doc.type)}</div>

              <div className="flex-1 min-w-0">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline block truncate"
                >
                  {doc.url.split("/").pop()}
                </a>
                <p className="text-xs text-gray-500">
                  {doc.type.toUpperCase()} •{" "}
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>

              {deletingDocId === doc._id ? (
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent ml-2"></div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc._id);
                  }}
                >
                  <Trash className="h-4 w-4 text-red-400" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          No documents found for this deal.
        </div>
      )}


    </div>
  );
}
