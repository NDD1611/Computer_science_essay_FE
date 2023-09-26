
import styles from './introduceDelete.module.scss'

const IntroduceDelete = () => {
    return (
        <div className={styles.introduceDelete}>
            <div className={styles.content}>
                <div>Delete Mode</div>
                <p>
                    This mode allows you to delete nodes and/or edges.
                </p>
                <div>Ways you can interact with the graph:</div>
                <ul>
                    <li>Click on a node to delete it</li>
                    <li>Click on an edge to delete it.</li>
                </ul>
            </div>
        </div >
    )
}

export default IntroduceDelete