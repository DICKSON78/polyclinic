import { useState, useCallback } from 'react';

const useConfirm = () => {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
  });

  const open = useCallback(({ title, message, confirmText, cancelText, onConfirm }) => {
    setState({
      isOpen: true,
      title,
      message,
      confirmText: confirmText || 'Confirm',
      cancelText: cancelText || 'Cancel',
      onConfirm,
    });
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (state.onConfirm) {
      state.onConfirm();
    }
    close();
  }, [state.onConfirm, close]);

  return {
    isOpen: state.isOpen,
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    open,
    close,
    handleConfirm,
  };
};

export default useConfirm;
