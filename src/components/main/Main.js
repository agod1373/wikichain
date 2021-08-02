import { useState, useRef, useEffect } from 'react'
import { Form, Button, ResponsiveEmbed } from 'react-bootstrap'
import '../wikis/SampleWiki'
import SampleWiki from '../wikis/SampleWiki'

export default function Main() {
    const learn = useRef('')
    const [main, setMain] = useState([])
    const [values, setValues] = useState([])

    const onSub = async (e) => {
        e.preventDefault()
        let rawSearchTerm = learn.current.value
        let editedSearchTerm = rawSearchTerm.replaceAll(' ', '%20')
        await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${editedSearchTerm}?redirect=false`)
            .then(response => response.json())
            .then(data => {
                setMain([data])
            })
        await fetch(`https://en.wikipedia.org/api/rest_v1/page/related/${editedSearchTerm}`)
            .then(response => response.json())
            .then(data => {
                setValues(Object.values(data.pages))
            })
    }

    useEffect(() => {
        speechSynthesis.cancel()
    })

    return (
        <div style={{ margin: '50px'}}>
            <p>WikiChain</p>
            <Form onSubmit={(e) => onSub(e)}>
                <div className="d-flex align-items-end"><Form.Group style={{ width: '300px', margin: '20px' }} controlId="exampleForm.ControlInput1">
                    <Form.Label>I want to learn about...</Form.Label>
                    <Form.Control ref={learn} placeholder="chess" />
                </Form.Group>
                <Button style={{ height: '40px', marginBottom: '20px' }} variant="primary" type="submit">go</Button></div>
            </Form>
            {values.length > 0 ? 
                <div className="d-flex flex-wrap justify-content-around">
                    {main.concat(values).map((value, key) => {
                        return <SampleWiki displayTitle={value.titles.normalized} title={value.title} pageid={value.pageid} extract={value.extract} extracthtml={value.extract_html} />
                    })}
                </div>
                :
                <div></div>
            }
            
        </div>
    )
}
