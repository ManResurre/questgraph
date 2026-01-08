const SamplyPlayer = ({link}: { link: string }) => {

    return (
        <iframe
            src={`https://samply.app/embed/${link}?color=242933`}
            width="100%"
            height="100px"
            style={{
                width: '100%',
            }}
        />
    );
}

export default SamplyPlayer;

