import prisma from "@/lib/db";
import Image from "next/image";



// export default async function Home() {
//   const posts= await prisma.post.findMany();
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//        <h1>osts
//         jfnnj
//        </h1>

//        <ul>
//         {posts.map((p)=>(
//           <li key={p.id}>
//             <strong>{p.id}</strong>
//                         <strong>{p.title}</strong>
//                                     <strong>{p.content}</strong>
//           </li>
//         ))}
//        </ul>
//       </main>
//     </div>
//   );
// }


// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import React from 'react'

// const page = () => {
//   return (

      
//           <div className="flex flex-col gap-3">
//       <Button asChild>
//         <Link href="/login">login</Link>
     
//       </Button>
//             <Button asChild>
//         <Link href="/signup">signup</Link>
     
//       </Button>
//             <Button asChild>
//         <Link href="/dashboard">dashboard(Protected)</Link>
     
//       </Button>
//     </div>
    

//   )
// }

// export default page

import React from 'react'

const page = () => {
  return (
    <div>
      <h1>hiiiiiiiiiiiiiiiiiii</h1>
    </div>
  )
}

export default page
