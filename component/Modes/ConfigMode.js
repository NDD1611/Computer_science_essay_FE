import styles from "./ConfigMode.module.scss";
import { useSelector, useDispatch } from "react-redux";
import  graphActions  from "../../redux/action/graphActions";
const ConfigMode = () => {
  let linkLength = useSelector((state) => state.graph.linkLength);
  const dispatch = useDispatch();
  const handleChange = (e) => {
    dispatch({
      type: graphActions.SET_LINK_LENGTH,
      linkLength: e.target.value,
    });
  };
  return (
    <div className={styles.ConfigMode}>
      <div className="flex gap-3">
        <div>Edge Length: </div>
        <input type="number" value={linkLength} onChange={handleChange} />
      </div>
    </div>
  );
};

export default ConfigMode;
