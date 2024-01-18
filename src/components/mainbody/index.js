import { h } from 'preact';
import style from "./style.less";
import Control from '../control';

const getControlsForSection = (section) => {
  // Mock function, replace with dynamic logic
  return [{ type: 'text', value: '' }, { type: 'checkbox', checked: false }];
};


const MainBody = ({ activeSection }) => {
  const controls = getControlsForSection(activeSection); // Implement this function based on your schema

  return (
    <div id="main-body" class={style.mainBody}>
      {controls.map(control => <Control control={control} />)}
    </div>
  );
};


export default MainBody;
