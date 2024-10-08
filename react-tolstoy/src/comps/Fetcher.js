import Result from './Result'
import InputURL from './InputUrl';
import Loader from './Loader';
import { useURL } from './URLProvider';
import { useState, useEffect } from 'react'
import '../css/Fetcher.css'

const Fetcher = () => {
    const { storedURL } = useURL();
    const [metadata, setMetadata] = useState([]);
    const [genErr, setGenErr] = useState('');
    const [counter, setCounter] = useState(3);
    const [loading, setLoading] = useState(false)
    const [urlInputs, setUrlInputs] = useState([]);

    useEffect(() => {
        setUrlInputs([]);
    }, []);

    const addField = (e) => {
        e.preventDefault();
        if (counter < 10) {
            setCounter(counter + 1);
            setUrlInputs([...urlInputs, '']);
        }
    };

    const handleInputChange = (index, value) => {
        const updatedInputs = [...urlInputs];
        updatedInputs[index] = value;
        setUrlInputs(updatedInputs);
    };

    const collectURLs = () => {
        return urlInputs
            .map((url, index) => [index, url])
            .filter(([_, url]) => url !== '');
    };

    const FetchMetadata = async (e) => {
        e.preventDefault();
        const collectedUrls = collectURLs();

        if (collectedUrls.length < 1) {
            setGenErr('At least one URL required');
            return;
        }
        else {
            setLoading(true)
            try {
                setGenErr('')
                console.log(`${storedURL}/fetch_metadata`)
                const response = await fetch(`${storedURL}/fetch_metadata`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ urls: collectedUrls }),
                });

                const data = await response.json();

                if (data.global_error) {
                    setGenErr(data.global_error);
                } else {
                    setMetadata(data);
                }

            } catch (error) {
                console.error('Error fetching metadata:', error);
                setGenErr('Error fetching metadata');
            }
            finally {
                setLoading(false)
            }
        }
    }

    return (
        <div className='fetcher' data-testid="fetcher-comp">
            <form onSubmit={FetchMetadata} className='fetch-form'>

                {[...Array(counter)].map((_, index) => {
                    const urlData = metadata.find(data => data.index === index);

                    return (
                        <div key={index}>
                            <InputURL
                                value={urlInputs[index] || ''}
                                onChange={(value) => handleInputChange(index, value)}
                            />
                            {urlData && (
                                <Result result={urlData} />
                            )}
                        </div>
                    );
                })}

                {counter < 10 && <button className='add-field-btn' onClick={addField}>+ Add Field</button>}

                <button type='submit' data-testid="submit-btn" className='submit-btn'>Fetch!</button>
            </form>
            {loading && <Loader />}
            {genErr && <p className='err-msg'>{genErr}</p>}
        </div>
    )
}

export default Fetcher