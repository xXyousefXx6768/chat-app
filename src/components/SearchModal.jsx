import React, { useRef,useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrayUnion, collection, doc, getDoc,  getDocs,  query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import {  db } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';
import { faMagnifyingGlass,faPlus } from '@fortawesome/free-solid-svg-icons';
function SearchModal({ onClose }) {
  const modalRef = useRef(null);
  const[people,setPeople]=useState(null)
  const[add,setAdd]=useState()
  const {user}=useUser()
          
  const handleSearch= async (e) => {
     e.preventDefault()
     const formdata= new FormData(e.target)
     const username =formdata.get('username')
     try {
      const userRef= collection(db,'users')
      const Query=query(userRef,where('username','==',username))
      const querySnapShot= await getDocs(Query)
      if (!querySnapShot.empty) {
        setPeople(querySnapShot.docs[0].data())
      }
      
     } catch (error) {
      console.log(error)
     }
  }

const AddUser= async () => {
  setAdd(!add)
     if (setAdd) {
       const ChatRef= collection(db,'chats')
       const userChatRef= collection(db,'userChat')

try {
  const newchatRef=doc(ChatRef)
  await setDoc(newchatRef,{
    createdAt:serverTimestamp(),
    messages:[]
  })
  await updateDoc(doc(userChatRef,user.id),{
    chats:arrayUnion({
      chatId:newchatRef.id,
      lastmessage:'',
      receiverId:people.id,
      updateAt:Date.now()
    })
  })
} catch (error) {
  
}

     }
}

  const handleClickOutside = (event) => {
    // Check if the click is outside the modal content
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleClickOutside}
      className="absolute top-0 justify-center items-center flex overflow-x-hidden overflow-y-auto inset-0 z-50 outline-none focus:outline-none h-screen w-[-webkit-fill-available] bg-black/40"
    >
      <section
        ref={modalRef} // Attach ref to the modal content
        className="bg-slate-200 rounded-xl w-2/3"
      >
        <section className="flex flex-col justify-center items-center">
          <div className="text-2xl p-6 font-medium font-mono">
            Search people
          </div>
          <form className='w-1/3' onSubmit={handleSearch}>
          <div className="input-box  overflow-hidden flex rounded-xl mb-7 p-1  bg-slate-400">
          <FontAwesomeIcon icon={faMagnifyingGlass} className='p-3 ' />
            <input type="text" name='username' className=' focus:outline-none  w-2/3 focus:ring-0 bg-transparent focus:shadow-none border-0' />
          </div>
          </form>
          <div className='result-box w-full flex pb-9 flex-col items-center '>


          { people?       
             <div className='result  min-h-32 max-h-6 overflow-y-auto shadow-lg bg-slate-300 w-2/3 rounded-xl flex flex-col '>
                  <section className='user-layout justify-around  p-4 flex w-full '>
                      <div className='userbox  items-center flex'>
                      <img
                  src={people.profilePicture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                />
                         
                          <h4 className='pl-3 text-lg font-semibold'>
                                {people.username}
                           </h4> 
                           </div>
                              <div className=' icons bg-slate-200 p-3 cursor-pointer flex '>
                                { add?
                               
                                <p  onClick={AddUser} className='text-sm'>
                                Added
                              </p>
                                :
                                <FontAwesomeIcon icon={faPlus}  onClick={AddUser} />
                                }
                                </div>   
                         
                 </section>
          </div>
          :
          <div className='result flex flex-col items-center justify-center rounded-xl bg-slate-300 w-2/3 min-h-32 max-h-6 '>
            <p className='text-xl font-mono opacity-40'>
              there is no people
            </p>
          </div>
}
</div>
        </section>
      </section>
    </div>
  );
}

export default SearchModal;
