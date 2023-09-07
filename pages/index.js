
import Link from "next/link";

const Home = () => {
    return (
        <div>
            Home page
            <div>
                <Link href='/regex2nfa' >regex to nfa</Link>
            </div>
            <div>
                <Link href='/nfa2dfa' >nfa to dfa</Link>
            </div>
        </div>
    )
}

export default Home;