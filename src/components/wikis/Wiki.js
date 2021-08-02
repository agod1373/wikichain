import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button, Dropdown, Spinner } from 'react-bootstrap'
import parse from 'html-react-parser'

export default function Wiki() {
    const title = useParams()
    const [html, setHTML] = useState('')
    const [text, setText] = useState('')
    const [titlesState, setTitles] = useState([])
    const [linksState, setLinks] = useState([])
    const [viewsState, setViews] = useState([])
    const [viewsLoading, setViewsLoading] = useState(true)
    const [voices, setVoices] = useState([])
    const htmlRef = useRef()
    const [playMode, setPlayMode] = useState('play')
    const [buttonText, setButtonText] = useState('Pause')
    let utterance

    const getHTML = async () => {
        await fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${title.title}`)
            .then(response => response.text())
            .then(async data => {
                let htm = data
                let htmr = htm.replace('<base href="//en.wikipedia.org/wiki/"/>', '')
                let htmlcss = htmr.replace(
                    '<link rel="stylesheet" href="',
                    '<link rel="stylesheet" href="https://en.wikipedia.org'
                )
                setHTML(htmlcss)
                setText(htmlRef.current?.innerText)
                utterance = new SpeechSynthesisUtterance(htmlRef.current?.innerText)
                play()
            })
            .then(() => getLinks())
    }

    const getLinks = async () => {
        const anchors = document.querySelectorAll("a")
        const titles = []
        const links = []
        const views = []
        const d = new Date()
        const lastMonth = new Date(Date.now() - 2764800000).toISOString().slice(0, 10).replaceAll('-', '')
        const thisMonth = d.toISOString().slice(0,10).replaceAll('-', '')
        for (let i=0; i<anchors.length; i++) {
            let tmp = document.createElement("p")
            tmp.appendChild(document.createTextNode(anchors[i]))
            const url = tmp.innerText
            if (!(url.includes('File:') || url.includes('#cite') || url.slice(22).includes('/') || url.includes('#'))) {
                //CHANGE WHEN URL IS CHANGED
                const titlesPre = url.slice(22)
                const titlesPost = titlesPre.replaceAll('_', ' ')
                await fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/all-agents/${titlesPre}/monthly/${lastMonth}/${thisMonth}`)
                    .then(response => response.json())
                    .then(data => {
                        try {
                            views.push(data.items[0].views)
                        } catch (error) {
                            views.push(0)
                        }
                    })
                titles.push(titlesPost)
                links.push(url)
            }
        }
        setTitles(titles)
        setLinks(links)
        setViews(views)
        setViewsLoading(false)
    }

    const play = () => {
        speechSynthesis.speak(utterance)
    }

    const pause = () => {
        if (playMode === 'play') {
            speechSynthesis.pause(utterance)
            setPlayMode('pause')
            setButtonText('Resume')
        } else {
            speechSynthesis.resume(utterance)
            setPlayMode('play')
            setButtonText('Pause')
        }
    }

    useEffect(() => {
        getHTML()
        console.log(speechSynthesis.getVoices())
        setVoices(speechSynthesis.getVoices())
    }, [])

    return (
        <div>
            <div className="d-flex">
                <Button variant='warning' onClick={() => pause()}>{buttonText}</Button>
                <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">Select Voice</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {voices.map((voice, key) => {
                            return <Dropdown.Item onClick={() => utterance.voice = voices[key]}>{voice.name} ({voice.lang})</Dropdown.Item>
                        })}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div style={{ overflow: 'scroll', height: '300px', marginBottom: '20px', borderBottom: '2px solid lightgrey'}}>
                <div className="d-flex">
                    <h4>Links | Title (views in past 30 days)</h4>
                </div>
                <div>
                    {viewsLoading ?
                        <div className="d-flex justify-content-center" style={{ marginTop: '100px'}}>
                            <Spinner animation="border" />
                        </div>
                        :
                        <div>
                            {titlesState.map((title, key) => {
                                return <a href={linksState[key]}>{title} ({viewsState[key]}) • </a>    
                            })}
                        </div>
                    }
                </div>
            </div>
            <div ref={htmlRef}>
                {parse(html)}
            </div>
        </div>
    )
}
