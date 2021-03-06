import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
// import { protectPage } from '../../hooks/protectPage'
import { getImageAll } from '../../services/image'
import { ImageCard } from './ImageCard'
import { ImageModal } from './ImageModal'
import { NoImage } from './NoImage'
import { ImagesContainer, PageContainer } from './styleContainer'
import { SearchBar } from '../../components/SearchBar/SearchBar'
import { useSelector } from 'react-redux'
import { Loading } from '../../components/Loading/Loading'
import { removeAcento } from '../../hooks/RemoveAcento'


export const ImageContainer = () => {
    const history = useHistory()

    const [imagesBd, setImagesBd] = useState(0)
    // const [imagesBd, setImagesBd] = useState([])
    const [modal, setModal] = useState({open:false, index: undefined})
    const [imageOrder, setImageOrder] = useState('desc')
    const searchText = useSelector(state => state.searchBar)


    const getImages = async () => {
        // console.log('getting images...')
        await getImageAll()
            .then(response => {           
                switch (response.status) {
                    case 200: response.data.length ? setImagesBd(response.data) : setImagesBd(undefined); break;
                    case 401: /*console.log(`[ImageContainer]: 401 Acesso não autorizado`);*/ setImagesBd(undefined); break;
                    case 400: /*console.log(`[ImageContainer]: 400 Acesso não autorizado`);*/ setImagesBd(undefined); break;
                    case 404: /*console.log(`[ImageContainer]: 404 Nenhuma imagem`)*/; setImagesBd(undefined); break;
                    default: console.log(`[ImageContainer]: [response]:`, response); break;
                }
                // console.log('getting images... DONE!')
            })
        // clearTimeout(getImagesCounter)
    }


    // let images = []
    let images
    let imageList = []
    if (imagesBd) {
        for (let i = 0; i < imagesBd.length; i++) {
            const image = imagesBd[i]
            const imageId = image.id
            const listIndex = imageList.indexOf(imageId)
            if (listIndex < 0) {
                imageList.push(imageId)
                const newImage = {...image, date: new Date(image.date), tags: [image.tag]}
                delete newImage.tag
                // images.push(newImage)
                images = images ? [...images, newImage] : [newImage]
            } else {
                images[listIndex].tags.push(image.tag)
            }
        }
    }
    
    // if (images.length) {
    if (images) {
        if (imageOrder === 'desc') {
            images.sort((a, b) => {
                return a.date > b.date ? -1 : a.date < b.date ? 1 : 0
            })
        } else if (imageOrder === 'asc') {
            images.sort((a, b) => {
                return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
            })
        }
    }

    if (images) {console.log(images)}

    // const cards = images.length && images.map((image, index) => {
    const cards = images && images.map((image, index) => {
        const collection = removeAcento(image.collection.toLowerCase())
        const subtitle = removeAcento(image.subtitle.toLowerCase())
        const tags = image.tags
        const search = searchText ? removeAcento(searchText) : ''

        if (search.length > 2) {
            if (collection.includes(search) || subtitle.includes(search)) {
                return <ImageCard key={index} image={image} index={index} setModal={setModal}/>
            }

            for (let i = 0; i < tags.length; i++) {
                const tag = tags[i]
                if (tag.includes(search)) {
                    return <ImageCard key={index} image={image} index={index} setModal={setModal}/>
                }
            }
        } else {
            return <ImageCard key={index} image={image} index={index} setModal={setModal}/>
        }
    })

    const searchBar = <SearchBar placeholder='título, coleção, tag...' />

    const pageContent =
        // imagesBd === false ?
        imagesBd === 0 ?
            <Loading/>
        :
        imagesBd === undefined ?
            <NoImage/>
        :
            <>
                {searchBar}
                <ImagesContainer>
                    {modal.open && <ImageModal images={images} setModal={setModal} index={modal.index} />}
                    {cards ? cards : 'Nenhuma imagem'}
                </ImagesContainer>
            </>


    // let getImagesCounter
    useEffect(() => {
        // getImagesCounter = setTimeout(()  => {
        //     getImages()
        // }, 1000)
        getImages()
    }, [])
    

    return (
        <PageContainer>
            {pageContent}
        </PageContainer>
    )
}
