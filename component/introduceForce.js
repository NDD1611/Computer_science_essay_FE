
import styles from './introduceForce.module.scss'

const IntroduceForce = () => {
    return (
        <div className={styles.introduceForce}>
            <div className={styles.content}>
                <div>Force Mode</div>
                <p>
                    In this mode, there is a gravitation pull that acts on the nodes and keeps them in the center of the drawing area.
                    Also, the nodes exert a force on each other, making the whole graph look and act like real objects in space.
                </p>
                <div>Ways you can interact with the graph:</div>
                <ul>
                    <li>Nodes support drag and drop.</li>
                </ul>
            </div>
        </div >
    )
}

export default IntroduceForce