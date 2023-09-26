
import styles from './Loader.module.scss'
import { Oval } from 'react-loader-spinner';

const Loader = () => {

    return (<div className={styles.loader}>
        <div className={styles.backgroundLoader}></div>
        <div className={styles.loaderContainer}>
            <Oval
                height={80}
                width={80}
                color="#202e3e"
                wrapperStyle={{}}
                wrapperClass="Loader"
                visible={true}
                ariaLabel='oval-loading'
                secondaryColor="#ccc"
                strokeWidth={2}
                strokeWidthSecondary={2}
            />
        </div>
    </div>
    )
}

export default Loader;