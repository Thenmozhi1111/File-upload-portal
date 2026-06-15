import "./Dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaEye,
  FaDownload,
  FaTrash,
  FaEdit
} from "react-icons/fa"; 

function Dashboard() {
  const role =localStorage.getItem("role");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [folders, setFolders] =
  useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [showFolderModal, setShowFolderModal] =
  useState(false);
  const [sortBy, setSortBy] =
  useState("date");
const [folderName, setFolderName] =
  useState("");
  const [previewFileData,
setPreviewFileData] =
useState(null);

const [showPreview,
setShowPreview] =
useState(false);

const [showRename, setShowRename] =
  useState(false);

const [selectedFile, setSelectedFile] =
  useState(null);

const [newFileName, setNewFileName] =
  useState("");

  const openRenameModal = (file) => {

  setSelectedFile(file);

  setNewFileName(
    file.filename.split(".")[0]
  );

  setShowRename(true);

};
  
const { userId } = useParams();

console.log("Dashboard User:", userId);
 

  // Fetch files from backend
const fetchFiles = async () => {

  try {

    const userId =
      localStorage.getItem("userId");

    const role =
      localStorage.getItem("role");

    console.log("FETCHING...");
    console.log(userId);
    console.log(role);

    const res = await axios.get(
      `http://localhost:5000/files/${userId}/${role}`
    );

    console.log("RESPONSE:");
    console.log(res.data);

    setFiles(res.data);

  } catch(err){

    console.log(err);

  }

};

 useEffect(() => {
    fetchFiles();
  }, [role]);

  // Drag and Drop
  const onDrop = (acceptedFiles) => {

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf"
  ];

  for (const file of acceptedFiles) {

    if (!allowedTypes.includes(file.type)) {

      setMessage(
        `${file.name} is not supported`
      );

      setTimeout(() => {
        setMessage("");
      }, 2000);

      return;
    }

    if (file.size > 15 * 1024 * 1024) {

  setMessage(
    `${file.name} exceeds 15MB limit`
  );

  setTimeout(() => {
    setMessage("");
  }, 2000);

  return;
}

  }

  setSelectedFiles(prev => [
    ...prev,
    ...acceptedFiles
  ]);

};

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop,
    multiple: true
  });

  // Upload File
const handleUpload = async () => {

  if (selectedFiles.length === 0) {
    alert("Select files first");
    return;
  }

  try {

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    formData.append(
  "userId",
  localStorage.getItem("userId")
);

    await axios.post(
      "http://localhost:5000/upload",
      formData,
      {
        onUploadProgress: (progressEvent) => {

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

    // Refresh file list
    fetchFiles();

    // Clear selected files
    setSelectedFiles([]);

    // Hide progress bar
    setUploadProgress(0);

    setMessage("✅ Upload Successful");

    setTimeout(() => {
    setMessage("");
    }, 2000);

  } catch (error) {

    console.log(error);

    // Hide progress bar on failure
    setUploadProgress(0);

    setMessage("❌ Upload Failed");

setTimeout(() => {
  setMessage("");
}, 2000);

  }

};


  // Delete File
  const deleteFile = async (id) => {

    try {

      await axios.delete(
        `http://localhost:5000/file/${id}`,
        {
 data:{
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

  // Download File
  const downloadFile = (filename) => {

    window.open(
      `http://localhost:5000/download/${filename}`
    );

  };

  // Dynamic Statistics
  const totalFiles = files.length;
  const totalfolders = folders.length;

 const totalStorage = files.reduce(
  (sum, file) =>
    sum + Number(file.filesize),
  0
);
    
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


  const fetchFolders = async () => {

  try {

    const res =
      await axios.get(
        "http://localhost:5000/folders"
      );

    setFolders(res.data);

  } catch (err) {

    console.log(err);

  }

};

useEffect(() => {

  fetchFiles();

  fetchFolders();

}, []);

const handleLogout = () => {

  localStorage.clear();

  navigate("/login");

};

const createFolder = async () => {

  if (!folderName.trim()) {

    return;

  }

  try {

    await axios.post(
      "http://localhost:5000/folder",
      {
        name: folderName,
        role:localStorage.getItem("role")
      }
    );

    setFolderName("");

    setShowFolderModal(false);

    fetchFolders();
    setMessage("✅ Folder Created");

  } catch (err) {

    console.log(err);

  }

};

const searchFiles = async () => {

  if (!searchTerm.trim()) return;

  try {

    const res = await axios.get(
`http://localhost:5000/search/${searchTerm}/${localStorage.getItem("userId")}/${localStorage.getItem("role")}`
);

    setSearchResults(res.data);

    setShowSearch(true);

  } catch (err) {

    console.log(err);

  }

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
        newName: newFileName,
         role: localStorage.getItem("role"),
        userId: localStorage.getItem("userId")
      }
    );

    setShowRename(false);

    fetchFiles();

    setMessage(
      "✅ File renamed"
    );

  } catch (err) {

    setMessage(
      "❌ Rename failed"
    );

  }

};

const moveFile = async(
  fileId,
  folderId
)=>{

  await axios.put(
    `http://localhost:5000/move-file/${fileId}`,
    {
      folderId
    }
  );

  fetchFiles();

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

  return (
    <div className="dashboard">

      <nav className="topbar">

        <h2>📁 Drive Portal</h2>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

      </nav>

      <div className="welcome">

        <h1>Welcome Back 👋</h1>

        <p>
          Manage your files securely
        </p>

      </div>
      {
  message && (
    <div className="message-box">
      {message}
    </div>
  )
}

      <div className="section">

  <div className="search-container">

    <input
      type="text"
      className="search-box"
      placeholder="Search Files..."
      value={searchTerm}
      onChange={(e) =>
        setSearchTerm(e.target.value)
      }
    />

    <button onClick={searchFiles} className="search-btn">
      Search
    </button>

  </div>

</div>

      <div className="stats">

        <div className="stat-card">
          <h2>{totalfolders}</h2>
          <p>Folders</p>
        </div>

        <div className="stat-card">
          <h2>{totalFiles}</h2>
          <p>Files</p>
        </div>

        <div className="stat-card">
          <h2>
              {formatFileSize(totalStorage)}
          </h2>
          <p>Storage</p>
        </div>

      </div>



      <div
        {...getRootProps()}
        className="upload-area"
      >

        <input  {...getInputProps()} />

        {selectedFiles.length === 0 ? (

          <>
            <h2>☁️ Upload Files</h2>

            <p>
              Drag & Drop Files Here
            </p>

            <p>
              Or Click Anywhere To Browse
            </p>
          </>

        ) : (

          <>
            <h2>
             ✅ {selectedFiles.length} File(s) Selected
</h2>

{
  selectedFiles.map((file,index)=>(
    <div key={index}>

      <p>{file.name}</p>

      <p>
        Size:
        {formatFileSize(file.size)}
      </p>

    </div>
  ))
}


            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
            >
              Upload File
            </button>

            {
  uploadProgress > 0 && (

    <div className="progress-container">

      <div
        className="progress-bar"
        style={{
          width:
            `${uploadProgress}%`
        }}
      >
        {uploadProgress}%
      </div>

    </div>

  )
}

          </>

        )}

      </div>

      <div className="section">

        <div className="section-header">

          <h2>Folders</h2>

         {
  localStorage.getItem("role")
  === "admin" && (

  <button
    className="new-folder-btn"
    onClick={() =>
      setShowFolderModal(true)
    }
  >
    + New Folder
  </button>

)
}
        </div>

        <div className="folders">

{
  folders.length === 0 ?

  (
    <p>
      No folders created yet
    </p>
  )

  :

  folders.map(folder => (

    <div
  key={folder.id}
  className="folder-card"
  onClick={() =>
  navigate(`/folder/${folder.id}`)
}
>
  📁 {folder.name}
</div>

  ))
}

</div>

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
                  

                </thead>

                <tbody>

                  {sortedFiles.filter(file => file.folder_id === null)
                  .map((file) => (

                   <tr key={file.id}>

                  <td>{file.filename}</td>

  <td>{file.filetype}</td>

  <td>
    {formatFileSize(
      file.filesize
    )}
  </td>

  <td>
    {
      new Date(
        file.uploaded_at
      ).toLocaleDateString()
    }
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

  <select
  onChange={(e)=>
    moveFile(
      file.id,
      e.target.value
    )
  }
>
  <option className="Move-option">
    Move To
  </option>

  {
    folders.map(folder=>(
      <option
        key={folder.id}
        value={folder.id}
      >
        {folder.name}
      </option>
    ))
  }

</select>

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
  showSearch && (

    <div className="search-popup">

      <h2>Search Results</h2>

      <button className="delete-btn"
        onClick={() =>
          setShowSearch(false)
        }
      >
        Close
      </button>

      {
        searchResults.map(file => (

          <div key={file.id}>

            <p>
              {file.filename}
            </p>

            <small>
              Path :
              {" "}
              {
                file.folder_name
                  ? file.folder_name
                  : "Root"
              }
            </small>

          </div>

        ))
      }

    </div>

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
  showFolderModal && (

    <div className="folder-modal">

      <div className="folder-modal-box">

        <h2>
          Create New Folder
        </h2>

        <input
          type="text"
          placeholder="Folder Name"
          value={folderName}
          onChange={(e) =>
            setFolderName(
              e.target.value
            )
          }
        />

        <div className="folder-modal-buttons">

          <button
            className="create-folder-btn"
            onClick={createFolder}
          >
            Create
          </button>

          <button
            className="cancel-folder-btn"
            onClick={() =>
              setShowFolderModal(false)
            }
          >
            Cancel
          </button>

        </div>

      </div>

    </div>

  )
}

      </div>

    </div>
    
  );
 
}

export default Dashboard;