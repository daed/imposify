import { h } from 'preact';
import style from './style.less';
import scrawl from '../../assets/logo.jpg';

const Sidebar = ({ changeSection }) => {
  const sections = ['Section1', 'Section2', 'Section3']; // Add more sections as needed

  return (
    <div id="sidebar" class={style.sidebar}>
      <div id="logo-container" class={style.mainLogoContainer}>
          <img class={style.mainLogo} src={scrawl} alt="a ms paint scribble of a logo" />
      </div>
      <ul>
        {sections.map(section => (
          <li onClick={() => changeSection(section)}>{section}</li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
