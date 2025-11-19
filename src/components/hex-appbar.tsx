import home from "../../public/home.svg"
import graph from "../../public/graph.svg"
import rank from "../../public/rank.svg"
import recommend from "../../public/recommend.svg"
import Image from "next/image"

const menuList = [
    {
        name: "home",
        icon: home,
    },
    {
        name: "graph",
        icon: graph,
    },
    {
        name: "rank",
        icon: rank,
    },
    {
        name: "recommend",
        icon: recommend,
    },
]
export const AppBar = () => {
    return (
        <div className="w-full h-18 bg-white absolute bottom-0 left-0 flex">
            {
                menuList.map((menu) => (
                    <MenuIcon key={menu.name} icon={menu.icon} name={menu.name}/>
                ))
            }
        </div>
    )
}

const MenuIcon = ({ icon, name }: { icon: any; name: string }) => {
    return (
        <div className="flex flex-col items-center">
            <Image src={icon} alt={name} />
            <p>{name}</p>
        </div>
    )
}
    