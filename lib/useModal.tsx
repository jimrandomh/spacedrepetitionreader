import React,{createContext,useContext,useState,useCallback} from 'react';
import {useJssStyles} from './useJssStyles';

type ModalDialogFn = (onClose: ()=>void)=>React.ReactNode;

const ModalContext = createContext<{
  openModal: (args: {fn: ModalDialogFn}) => void
}|null>(null);

export function useModal(): {
  openModal: (args: {fn: ModalDialogFn})=>void
} {
  return useContext(ModalContext)!;
}

export function ModalDialog({children}: {children: React.ReactNode}) {
  const classes = useJssStyles("ModalDialog", () => ({
    container: {
      position: "absolute",
      top: 0, left: 0,
      right: 0, bottom: 0,
      background: "rgba(0,0,0,.3)",
    },
    greyBackground: {
      position: "absolute",
      top: 0, left: 0,
      right: 0, bottom: 0,
      background: "rgba(0,0,0,.8)",
      zIndex: 0,
    },
    dialog: {
      marginLeft: "auto", marginRight: "auto",
      top: 300,
      background: "white",
      width: 600,
      position: "relative",
      zIndex: 1,
      padding: 16,
    }
  }));
  
  return <div className={classes.container}>
    <div className={classes.greyBackground}/>
    <div className={classes.dialog}>
      {children}
    </div>
  </div>;
}

export function ModalContextProvider({children}: {children: React.ReactNode}) {
  const [modal,setModal] = useState<{fn:ModalDialogFn}|null>(null);
  const [count,setCount] = useState(0);
  
  const openModal = (args: {fn: ModalDialogFn}) => {
    setModal(() => args);
  };
  const closeModal = () => {
    setModal(null)
  };
  
  return <ModalContext.Provider value={{openModal}}>
    <div>
      {children}
    </div>
    
    {modal && <div>
      {(modal.fn)(closeModal)}
    </div>}
  </ModalContext.Provider>
}
