import { h } from 'preact';

const Control = ({ control }) => {
  switch (control.type) {
    case 'text':
      return <input type="text" value={control.value} />;
    case 'checkbox':
      return <input type="checkbox" checked={control.checked} />;
    default:
      return null;
  }
};

export default Control;
