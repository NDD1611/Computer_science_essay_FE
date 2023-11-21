
import styles from './introduceDraw.module.scss'

const IntroduceDraw = () => {
    return (
        <div className={styles.introduceDraw}>
            <div className={styles.content}>
                <div>Draw Mode</div>
                <p>
                    This mode allows you to draw new nodes and/or edges.
                </p>
                <div>Ways you can interact with the graph:</div>
                <ul>
                    <li>Clicking anywhere on the graph canvas creates a new node.</li>
                    <li>Clicking on a node starts the drawing process of a new edge.</li>
                    <li>To cancel the new edge, click anywhere on the canvas.</li>
                    <li>To finish drawing the edge, click on the desired neighbor.</li>
                </ul>
            </div>
        </div >
    )
}

export default IntroduceDraw