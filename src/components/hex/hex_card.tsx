interface HexInfoCardProps {
  iconSection: React.ReactNode;
  title: string;
  rightSection: React.ReactNode;
}

export const HexInfoCard = ({ iconSection, title, rightSection }: HexInfoCardProps) => {
    return (
        <div className="flex ">
            <div className="flex">

            {iconSection}
            <p>{title}</p>
            </div>
            {rightSection}
        </div>
    )
}