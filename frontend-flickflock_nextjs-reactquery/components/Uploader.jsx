import { storage, STATE_CHANGED } from '../lib/firebase';
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../lib/context";
import Loader from "./Loader";
import toast from "react-hot-toast";
import {  useQueryClient } from "react-query";
import debounce from 'lodash.debounce';
import { createPost } from '../lib/authServices'
import S3 from 'aws-sdk/clients/s3'
// video uploader
export default function Uploader({ currentUser }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userContext, setUserContext] = useContext(UserContext);
  const [downloadURL, setDownloadURL] = useState(null);
  let username = userContext?.user?.username?.username
  const queryClient = useQueryClient()

  const uploadFile = async (e) => {
    const file = Array.from(e.target.files)[0];
    const extension = file.type.split('/')[1];
    const newFileName = `${Date.now()}.${extension}`
    setUploading(true);

    // Access control for this bucket is set on Wasabi, making it ok to expose the keys
    const s3 = new S3({
      correctClockSkew: true,
      endpoint: 'https://s3.us-central-1.wasabisys.com', 
      accessKeyId: 'RE6657UX0JQ7UF1ECM9J',
      secretAccessKey: 'DzSuVBfPLpJWpcVJeifRJBHmAwtcalJpn52p7VES',
      region: 'us-central-1'
    });
  
    const uploadRequest = new S3.ManagedUpload({
      params: { Bucket: 'flickflock', Key: newFileName, Body: file },
      service: s3
    });
  
    uploadRequest.on('httpUploadProgress', function(event) {
      const progressPercentage = Math.floor(event.loaded * 100 / event.total);
      setProgress(progressPercentage);
    });
  
  
    uploadRequest.send(function(err, data) {
      if (err) {
        console.log('UPLOAD ERROR: ' + JSON.stringify(err, null, 2));
      } else {
        setDownloadURL(data.Location)
      }
    });
    
  };

    const updatePostStorage = debounce(async () =>{
        await createPost(downloadURL)
        setDownloadURL(null)
        setUploading(false);
        queryClient.invalidateQueries(username)
        toast.success('Post Created!')
    },1000);

    useEffect(()=>{
      if(username && downloadURL){
        updatePostStorage();
      }
    },[downloadURL])

    const createPostFromUpload = async (e) => {
        if(e.target?.files){
         await uploadFile(e)
        }
    };


  /* const uploadFile = async (e) => {
    // Get the file
    const file = Array.from(e.target.files)[0];
    const extension = file.type.split('/')[1];
    // Makes reference to the storage bucket location
    let ref = storage.ref(`/videos/${Date.now()}.${extension}`);
    setUploading(true);

    // Starts the upload
    const task = ref.put(file);

    // Listen to updates to upload task
    task.on(STATE_CHANGED, (snapshot) => {
      const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
      setProgress(pct);
      // Get downloadURL AFTER task resolves 
      task
        .then((d) => ref.getDownloadURL())
        .then((url) => {
          setDownloadURL(url);
        });
    }, function error(err){}, async () => { return null});
    
  }; */

  return (
    <div className="box-loader">
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <>
          <div className="image-upload">
            <label htmlFor="file-input">
              <img alt="camera-upload" src="/images/upload-logo.png" />
            </label>
            <input
              id="file-input"
              type="file"
              onChange={createPostFromUpload}
              accept="video/mp4,video/x-m4v,video/*"
            />
          </div>
        </>
      )}
    </div>
  );
}
