import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useRef } from "react";
import "./Folder.css";
import "./Dashboard.css";
import {
  FaEye,
  FaDownload,
  FaTrash,
  FaEdit
} from "react-icons/fa"; 

function Folder() {
  const { id } = useParams();
  const folderId=id;
  
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [folder, setFolder] = useState({});
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [previewFileData,setPreviewFileData] =useState(null);
  const [sortBy, setSortBy] =useState("date");
  const [showSubFolderModal,setShowSubFolderModal] =useState(false);
  const [subFolderName,setSubFolderName] =useState("");
  const [subFolders,setSubFolders] =useState([]);
  const [breadcrumb,setBreadcrumb] = useState([]);
const [showPreview,setShowPreview] = useState(false);

const [showRename, setShowRename] = useState(false);

const userId=localStorage.getItem("userId");
const [newFileName, setNewFileName] =
  useState("");

  const openRenameModal = (file) => {

  setSelectedFile(file);

  setNewFileName(
    file.filename.split(".")[0]
  );

  setShowRename(true);

};

const [showRenames, setShowRenames] =  useState(false);

const [newFolderName, setNewFolderName] = useState("");

  const openRenameModals = (folder) => {

  setFolder(folder);

  setNewFolderName(
    folder.name
  );

  setShowRenames(true);

};

const [showDeleteFolder,setShowDeleteFolder] =useState(false);

  useEffect(() => {
    fetchFolder();
    fetchFiles();
    fetchSubFolders();
    fetchBreadcrumb();
  }, [id,folderId]);

  const fetchSubFolders =
async()=>{

  const res =
  await axios.get(
   `http://localhost:5000/subfolders/${folderId}`
  );

  console.log("Subfolders:",res.data),

  setSubFolders(
    res.data
  );

};

  const fetchFolder = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/folder/${id}`
      );

      setFolder(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFiles = async () => {
    try {

      const userId =
      localStorage.getItem("userId");

    const role =
      localStorage.getItem("role");
      console.log(id)
      console.log(userId)
      console.log(role)
    
      const res = await axios.get(
        `http://localhost:5000/folder-files/${id}/${userId}/${role}`
      );
      console.log("API RESPONSE:");
console.log(res.data);
console.log(Array.isArray(res.data));



      setFiles(res.data);
    } catch (err) {
      console.log(err);
    }
  };
useEffect(() => {
  console.log("FILES STATE UPDATED:");
  console.log(files);
  console.log("Length:", files.length);
}, [files]);

  const fetchBreadcrumb =
async () => {

  try {

    const res =
      await axios.get(
        `http://localhost:5000/breadcrumb/${folderId}`
      );

    setBreadcrumb(
      res.data
    );

  } catch(err){

    console.log(err);

  }

};

  const uploadFile = async () => {
  if (!selectedFile) {
    alert("Select a file");
    return;
  }

  const formData = new FormData();
  formData.append(
  "userId",
  localStorage.getItem("userId")
);
  formData.append("files", selectedFile);
  formData.append("folder_id", id); // IMPORTANT

  if (!id) {
  return res.status(400).json({ message: "Folder ID required" });
}

  try {
    await axios.post("http://localhost:5000/upload", 
      formData,

    {onUploadProgress : (progressEvent) => {

          const percentCompleted =
            Math.round(
              (progressEvent.loaded * 100) /
              progressEvent.total
            );

          setUploadProgress(
            percentCompleted
          );
    }
  }

  );

    setSelectedFile(null);
    fileInputRef.current.value = "";
    fetchFiles();
    setMessage("✅ Upload Successful");

    setTimeout(() => {
    setMessage("");
    }, 2000);
  } catch (err) {
    console.log(err);
    setUploadProgress(0);

    setMessage("❌ Upload Failed");

    setTimeout(() => {
    setMessage("");
    }, 2000);
  }
};

  const deleteFile = async (fileId) => {
    try {
      await axios.delete(
        `http://localhost:5000/file/${fileId}`,
        { data:{
   role:localStorage.getItem("role"),
   userId:localStorage.getItem("userId")
 }
}
      );

      fetchFiles();
    } catch (err) {
      console.log(err);
    }
  };

  const downloadFile = (filename) => {
    window.open(
      `http://localhost:5000/download/${filename}`
    );
  };

  const formatFileSize = (bytes) => {

  if (bytes < 1024)
    return bytes + " B";

  if (bytes < 1024 * 1024)
    return (bytes / 1024).toFixed(2) + " KB";

  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";

  return (
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(2) + " GB";
}; 

const getFileType = (type) => {

  switch(type){

    case "image/jpeg":
      return "JPG Image";

    case "image/png":
      return "PNG Image";

    case "application/pdf":
      return "PDF Document";

    case "application/msword":
      return "DOC Document";

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "DOCX Document";

    default:
      return type;
  }

};

const previewFile = (file) => {

  setPreviewFileData(file);

  setShowPreview(true);

};

const saveRename = async () => {

  try {

    await axios.put(
      `http://localhost:5000/rename/${selectedFile.id}`,
      {
        newName: newFileName
      }
    );

    setShowRename(false);

    fetchFiles();

    setMessage(
      "✅ File renamed"
    );
    setTimeout(() => {
    setMessage("");
    }, 2000);

  } catch (err) {

    setMessage(
      "❌ Rename failed"
    );
    setTimeout(() => {
    setMessage("");
    }, 2000);

  }

};

const saveRenames = async () => {

  try {

    await axios.put(
      `http://localhost:5000/rename/folder/${folder.id}`,
       
 { 
  name: newFolderName
 }
      
  ,console.log(`http://localhost:5000/rename/folder/${folder.id}`),
      console.log(newFolderName),
      console.log(role)
    );

    setShowRenames(false);

     navigate(`/dashboard/${userId}`);


    setMessage(
      "✅ Folder renamed"
    );
    setTimeout(() => {
    setMessage("");
    }, 2000);

  } catch (err) {

    setMessage(
      "❌ Rename failed"
    );
    setTimeout(() => {
    setMessage("");
    }, 2000);

  }

};



const deleteFolder = async(id)=>{

  const confirmDelete =
    window.confirm(
      "Delete this folder?"
    );

  if(!confirmDelete)
    return;

  try{

    await axios.delete(
      `http://localhost:5000/folder/${id}`
    );

    navigate(`/dashboard/${userId}`);

  }catch(err){

    console.log(err);
    window.alert("The folder is not empty");

  }

};

const sortedFiles = [...files];

if (sortBy === "name") {

  sortedFiles.sort((a, b) =>
    a.filename.localeCompare(
      b.filename
    )
  );

}

if (sortBy === "size") {

  sortedFiles.sort(
    (a, b) =>
      b.filesize - a.filesize
  );

}

if (sortBy === "date") {

  sortedFiles.sort(
    (a, b) =>
      new Date(b.uploaded_at) -
      new Date(a.uploaded_at)
  );

}

const createSubFolder =
async () => {

  try {

    await axios.post(
      "http://localhost:5000/folder",
      {
        name: subFolderName,
        parent_id: folderId
      }
    );

    setShowSubFolderModal(
      false
    );
    setMessage(
      "✅ Folder created"
    );
    setTimeout(() => {
    setMessage("");
    }, 2000);

    fetchFolder();

  } catch(err){

    console.log(err);
    setMessage(
      "failed to create"
    );
    setTimeout(() => {
    setMessage("");
    }, 2000);

  }

};

  return (
    <div className="folder-page">

      <div className="folder-header">

        <button
  className="back-btn"
  onClick={() => {

    if(folder?.parent_id){

      navigate(
        `/folder/${folder.parent_id}`
      );

    }else{

       navigate(`/dashboard/${userId}`);

    }

  }}
>
  ⬅ Back
</button>

        <div className="folder-card">
          <div className="breadcrumb">

  <span>
    My Files
  </span>

  {
    breadcrumb.map(folder => (

      <span onClick={() => navigate(-1)} key={folder.id}>

        {" > "}

        {folder.name}

      </span>

    ))
  }

</div>

  <div
    onClick={() =>
      navigate(
        `/folder/${folder.id}`
      )
    }
  >
    📁 {folder.name}
  </div>
{
  message && (
    <div className="message-box">
      {message}
    </div>
  )
}

  <div className="folder-actions">
    {
 localStorage.getItem("role")
 === "admin" && (
 <button
className="sub-folder-btn"
onClick={() =>
setShowSubFolderModal(true)
}
>
➕ Folder
</button>
 )}
{
 localStorage.getItem("role")
 === "admin" && (
    <FaEdit
        className="action-icon rename-icon"
        onClick={() =>
          openRenameModals(folder)
        }
      />
)}
{
 localStorage.getItem("role")
 === "admin" && (
        <FaTrash
          className="action-icon delete-icon"
          onClick={() => setShowDeleteFolder(true)}
          title="Delete"
        />
 )}
    

  </div>

</div>
      </div>

      <div className="subfolders-section">

<h3>
Sub Folders
</h3>

<div className="folders">

{
subFolders.map(folder => (

<div
key={folder.id}
className="folder-card"
onClick={() =>
navigate(
`/folder/${folder.id}`
)
}
>

📁 {folder.name}

</div>

))
}

</div>

</div>

      <div className="upload-section">

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) =>
            setSelectedFile(e.target.files[0])
          }
        />

        <button
          className="upload-btn"
          onClick={uploadFile}
        >
          Upload File
        </button>

      </div>

      <div className="section">
        
      
              <h2>Recent Files</h2>
      
              {
                files.length === 0 ?
      
                  (
                    <p>
                      No files uploaded yet.
                    </p>
                  )
      
                  :
      
                  (
      
                    <table>
      
                      <thead>
      
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Size</th>
                          <th>Uploaded Date</th>
                          <th>Action</th>
                          {
                          role === "admin" &&
                            <th>Owner</th>
                          }
                        </tr>
                        <div className="sort-container">

  <label>
    Sort By:
  </label>

  <select
    value={sortBy}
    onChange={(e) =>
      setSortBy(
        e.target.value
      )
    }
  >

    <option value="date">
      Latest First
    </option>

    <option value="name">
      File Name
    </option>

    <option value="size">
      File Size
    </option>

  </select>

</div>
      
                      </thead>
      
                      <tbody>
      
                        {sortedFiles
  .filter(file =>
    file.folder_id === Number(id)
  )
  .map((file) => (
                          <tr key={file.id}>
      
                        <td>
                          {file.filename}
                        </td>
      
                        <td>
                          {getFileType(file.filetype)}
                        </td>

                        <td>
    {formatFileSize(
      file.filesize
    )}
  </td>
      
                        <td>
                          {new Date(
                            file.uploaded_at
                            ).toLocaleString()}
                        </td>
      
                                <td className="action-buttons">
      
        <FaEye
          className="action-icon preview-icon"
          onClick={() => previewFile(file)}
          title="Preview"
        />
      
        <FaDownload
          className="action-icon download-icon"
          onClick={() => downloadFile(file.filename)}
          title="Download"
        />
      
      <FaEdit
        className="action-icon rename-icon"
        onClick={() =>
          openRenameModal(file)
        }
      />
      
        <FaTrash
          className="action-icon delete-icon"
          onClick={() => deleteFile(file.id)}
          title="Delete"
        />
      
      </td>
      {
  role === "admin" &&
  <td>{file.username}</td>
}
      
                            </tr>
      
                          ))
                        }
                        
      
                      </tbody>
      
                    </table>
      
                  )
              }
      
        
      
      {
        showPreview &&
        previewFileData && (
      
          <div className="preview-modal">
      
            <div className="preview-content">
      
              <button
                className="close-btn"
                onClick={() =>
                  setShowPreview(false)
                }
              >
                ✖
              </button>
      
              {
                previewFileData.filetype?.startsWith(
                  "image"
                ) ? (
      
                  <img
                    src={`http://localhost:5000/uploads/${previewFileData.filename}`}
                    alt="preview"
                    className="preview-image"
                  />
      
                ) : previewFileData.filetype ===
                    "application/pdf" ? (
      
                  <iframe
                    title="pdf"
                    src={`http://localhost:5000/uploads/${previewFileData.filename}`}
                    className="preview-pdf"
                  />
      
                ) : (
      
                  <h3>
                    Preview Not Available
                  </h3>
      
                )
              }
      
            </div>
      
          </div>
      
        )
      }
      
      {
        showRename && (
          <div className="rename-modal">
            <div className="rename-box">
      
              <h3>Rename File</h3>
      
              <input
                type="text"
                value={newFileName}
                onChange={(e) =>
                  setNewFileName(e.target.value)
                }
              />
      
              <div className="rename-buttons">
      
                <button
                  className="rename-save"
                  onClick={saveRename}
                >
                  Save
                </button>
      
                <button
                  className="rename-cancel"
                  onClick={() =>
                    setShowRename(false)
                  }
                >
                  Cancel
                </button>
      
              </div>
      
            </div>
          </div>
        )
      }

      {
  showRenames && (
    <div className="rename-modal">
      <div className="rename-box">

        <h3>Rename Folder</h3>

        <input
          type="text"
          value={newFolderName}
          onChange={(e) =>
            setNewFolderName(e.target.value)
          }
        />

        <div className="rename-buttons">

          <button
            className="rename-save"
            onClick={saveRenames}
          >
            Save
          </button>

          <button
            className="rename-cancel"
            onClick={() =>
              setShowRenames(false)
            }
          >
            Cancel
          </button>

        </div>

      </div>
    </div>
  )
}

{
showDeleteFolder && (

<div className="rename-modal">

  <div className="rename-box">

    <h3>
      Delete Folder?
    </h3>

    <p>
      This action cannot be undone.
    </p>

    <div className="rename-buttons">

      <button
        className="rename-save"
        onClick={() =>
          deleteFolder(folder.id)
        }
      >
        Delete
      </button>

      <button
        className="rename-cancel"
        onClick={() =>
          setShowDeleteFolder(false)
        }
      >
        Cancel
      </button>

    </div>

  </div>

</div>

)}

{
  showSubFolderModal && (

    <div className="folder-modal">

      <div className="folder-modal-box">

        <h2>Create Sub Folder</h2>

        <input
          type="text"
          value={subFolderName}
          onChange={(e) =>
            setSubFolderName(
              e.target.value
            )
          }
          placeholder="Folder Name"
        />

        <button
        className="rename-save"
          onClick={createSubFolder}
        >
          Create
        </button>

        <button
        className="rename-cancel"
          onClick={() =>
            setShowSubFolderModal(false)
          }
        >
          Cancel
        </button>

      </div>

    </div>

  )
}
      
            </div>
      
          </div>
  );
}

export default Folder;