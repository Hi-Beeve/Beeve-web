
import Image from "next/image";
import { useEffect, useState } from "react";
import default_profile from "../../public/default_profile.svg";

export default function ProfileCircle({ profile }: { profile: string }) {
    const [src, setSrc] = useState(default_profile);
     useEffect(()=>{
        if(profile){
        setSrc(profile)
      }
      },[profile])
    return (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <Image
            src={src}
            alt="profile"
            className="w-full h-full object-cover"
            width={32}
            height={32}
            onError={(e)=>{
                setSrc(default_profile);
            }}
            />
        </div>
    );
}