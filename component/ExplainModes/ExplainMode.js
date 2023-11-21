
import ConfigMode from '../Modes/ConfigMode';
import IntroduceDelete from '../Modes/introduceDelete';
import IntroduceDraw from '../Modes/introduceDraw';
import IntroduceEdit from '../Modes/introduceEdit';
import IntroduceForce from '../Modes/introduceForce';
import styles from './ExplainMode.module.scss'
export const ExplainMode = ({ mode, setMode = () => { } }) => {
    return (
        <>
            <div className={styles.mode}>
                <button
                    className={mode === 0 ? styles.selectMode : ""}
                    onClick={() => {
                        setMode(0);
                    }}
                >
                    Force
                </button>
                <button
                    className={mode === 1 ? styles.selectMode : ""}
                    onClick={() => {
                        setMode(1);
                    }}
                >
                    Draw
                </button>
                <button
                    className={mode === 2 ? styles.selectMode : ""}
                    onClick={() => {
                        setMode(2);
                    }}
                >
                    Delete
                </button>
                <button
                    className={mode === 3 ? styles.selectMode : ""}
                    onClick={() => {
                        setMode(3);
                    }}
                >
                    Edit
                </button>
                <button
                    className={mode === 4 ? styles.selectMode : ""}
                    onClick={() => {
                        setMode(4);
                    }}
                >
                    Config
                </button>
            </div>
            <div>
                {mode == 0 && <IntroduceForce />}
                {mode == 1 && <IntroduceDraw />}
                {mode == 2 && <IntroduceDelete />}
                {mode == 3 && <IntroduceEdit />}
                {mode == 4 && <ConfigMode />}
            </div>
        </>
    );
};
