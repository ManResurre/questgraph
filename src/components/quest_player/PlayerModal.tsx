import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import {usePlayer} from "@/components/sidebar/PlayerProvider";
import Draggable from 'react-draggable';
import {IconButton} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import Player from "@/components/quest_player/Player.tsx";
import SamplyPlayer from "@/components/samply_player/SamplyPlayer.tsx";


const style = {
    position: 'absolute',
    right: '60%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 2,
    resize: 'both',
    overflow: 'auto'
};

const DraggableBox = ({nodeRef, children}: any) => {

    return (
        <Draggable handle=".drag-handle" nodeRef={nodeRef}>
            <Box ref={nodeRef} sx={style}>
                {children}
            </Box>
        </Draggable>
    );
}

const PlayerModal = () => {
    const {openModal, setOpenModal, currentScene} = usePlayer();
    const handleOpen = () => setOpenModal(true);
    const handleClose = () => setOpenModal(false);

    const nodeRef = React.useRef(null);

    return <Modal
        open={openModal}
        onClose={handleClose}
        hideBackdrop
    >
        <DraggableBox nodeRef={nodeRef}>
            <div className="drag-handle p-2 bg-neutral-800 flex justify-between items-center" style={{cursor: 'move'}}>
                Debug Player
                <IconButton onClick={handleClose}><CloseIcon/></IconButton>
            </div>
            <div className="p-2">
                <Player/>
                {currentScene?.samplyLink && <SamplyPlayer link={currentScene?.samplyLink}/>}
            </div>
        </DraggableBox>
    </Modal>
}

export default React.memo(PlayerModal);
