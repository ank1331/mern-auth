import { useSelector } from "react-redux"
import { useRef, useState, useEffect } from "react"
import {app} from "../firebase"
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage"
import { useDispatch } from "react-redux"
import { updateUserFailure, updateUserSuccess, updateUserStart, signInFailure, deleteUserStart, deleteUserFailure, deleteUserSuccess, signOut } from "../../redux/user/userSlice"


export default function Profile() {
  const fileRef = useRef(null)
  const [image, setImage] = useState(undefined)
  const [imagePercent, setImagePercent] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [formData, setFormdata] = useState({})
  const [updateSuccess, setupdateSuccess] = useState(false)
  const dispatch = useDispatch()
  
  const {currentUser, loading, error} = useSelector((state) => state.user)
  
// console.log(imageError)
// console.log(formData)
  useEffect(()=>{
    if(image){
      handleFileupload(image)
    }
  },[image])
  const handleFileupload = async (image)=>{
    const storage = getStorage(app)
    const fileName = new Date().getTime()+image.name
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      "state_changed",(snapshot)=>{
        const progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100
        setImagePercent(Math.round(progress))
        
      },
    (error) =>{
      setImageError(true)
      // console.log(error)
    },
    ()=>{
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=> setFormdata({...formData, profilePicture:downloadURL}));
      })
      
  };
  const handleChange = async(e)=>{
    setFormdata({...formData, [e.target.id]:e.target.value})
  };
  console.log(formData)

  const handleSubmit = async(e)=>{
    e.preventDefault()
    try {
      dispatch(updateUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify(formData)
      })
      const data = await res.json();
      if(data.success ===false){
        dispatch(updateUserFailure(data))
        return;
      }
      dispatch(updateUserSuccess(data))
      setupdateSuccess(true)
    } catch (error) {
      dispatch(updateUserFailure(error))
      
    }

  }

  const handleDelete = async()=>{
    try {
      dispatch(deleteUserStart())
      const res= await fetch(`/api/user/delete/${currentUser._id}`,{
      method:"DELETE",
      })
      const data = await res.json()
      if(data.success === false){
        dispatch(deleteUserFailure(data))
        return;
      }
      dispatch(deleteUserSuccess())
      
    } catch (error) {
      dispatch(deleteUserFailure(error))
      
    }
  }

  const handleSignout= async()=>{
    try {
      await fetch("/api/auth/signout")
      dispatch(signOut())
    } catch (error) {
      console.log(error)
    }
  }
  
 
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className='text-3xl font-semibold text-center my-7'> Profile</h1>
      <form className="flex flex-col gap-4" onSubmit = {handleSubmit}>
        <input type="file" ref = {fileRef} hidden accept = "image/*" onChange={(e)=>setImage(e.target.files[0])}/>
        < img src={formData.profilePicture||currentUser.profilePicture} alt="profile" className="h-24 w-24 self-center cursor-pointer rounded-full object-cover mt-2" onClick={()=>fileRef.current.click()} onChange={handleChange}/>
        <p className='text-sm self-center'>
          {imageError ? (
            <span className='text-red-700'>
              Error uploading image (file size must be less than 2 MB)
            </span>
          ) : imagePercent > 0 && imagePercent < 100 ? (
            <span className='text-slate-700'>{`Uploading: ${imagePercent} %`}</span>
          ) : imagePercent === 100 ? (
            <span className='text-green-700'>Image uploaded successfully</span>
          ) : (
            ''
          )}
        </p>
        <input defaultValue= {currentUser.username} type="text" id="username" placeholder="Username" className="bg-slate-100 rounded-lg p-3" onChange={handleChange}/>
        <input type="email" defaultValue= {currentUser.email} id="email" placeholder="Email" className="bg-slate-100 rounded-lg p-3" onChange={handleChange}/>
        <input type="password" id="password" placeholder="Password" className="bg-slate-100 rounded-lg p-3" onChange={handleChange}/>
        <button className="bg-slate-700 rounded-lg p-3 text-white uppercase hover:opacity-95 disabled:opacity-80">{loading? "Loading...":"UPDATE"}</button>
      </form>
      <div className="flex justify-between mt-5">
        <span onClick = {handleDelete} className="text-red-700 cursor-pointer"> Delete account</span>
        <span onClick = {handleSignout} className="text-red-700 cursor-pointer"> Sign Out</span>
      </div>
      <p className="text-red-700 mt-5">{error && "something went worng"}</p>
      <p className="text-green-700 mt-5">{updateSuccess && "User Updated Successfully"}</p>
    </div>
  )
}
