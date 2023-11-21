
import styles from './introduceEdit.module.scss'

const IntroduceEdit = () => {
    return (
        <div className={styles.introduceEdit}>
            <div className={styles.content}>
                <div>Edit Mode</div>
                <p>
                    This mode allows you to edit  edges' labels.
                </p>
                <div>Ways you can interact with the graph:</div>
                <ul>
                    <li>Click on an edge to change it's label. Now you can start typing in order to edit the cost. Click anywhere or press Enter to finish editing.</li>
                </ul>
            </div>
        </div >
    )
}

export default IntroduceEdit