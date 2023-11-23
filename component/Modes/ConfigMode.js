import styles from "./ConfigMode.module.scss";
import { useSelector, useDispatch } from "react-redux";
import graphActions from "../../redux/action/graphActions";
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
            <div className={styles.content}>
                <div>Config Mode</div>
                <p>
                    This mode allows you to change label of node and adjust parameters.
                </p>
                <div>Ways you can interact with the graph:</div>
                <ul>
                    <li>Click on a node to change label</li>
                </ul>
            </div>
            <div>Parameters: </div>
            <div className="flex gap-3 pl-[20px]">
                <div>Edge Length: </div>
                <input type="number" value={linkLength} onChange={handleChange} />
            </div>
        </div >
    );
};

export default ConfigMode;
