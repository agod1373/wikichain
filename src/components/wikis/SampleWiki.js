import React, {useEffect, useState} from 'react'
import { useHistory } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import parse from 'html-react-parser'
import './SampleWiki.scss'

export default function SampleWiki(props) {
    const [htmlString, setHtmlString] = useState('<p>test</p>')
    const [alt, setAlt] = useState('')
    const [src, setSrc] = useState('')
    const history = useHistory()

    const getHTML = async () => {
        await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${props.title}`)
            .then(response => response.json())
            .then(data => {
                try {
                    setSrc(data.items[0].srcset[0].src)
                } catch (error) {
                    getHTML()
                }
                
            })
    }

    const pushToWiki = () => {
        history.push(`${props.title}`)
    }

    useEffect(() => {
        getHTML()
    })

    return (
        <div className="samplewiki" onClick={() => pushToWiki()}>
            {src ? <img src={src} alt={alt} className="samplethumbnail" /> : <span></span>}
            <div className="sampleextract">{parse(props.extracthtml)}</div>
        </div>
    )
}
