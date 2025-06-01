import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {Box, Container, Typography, CircularProgress} from '@mui/material'

type Props = {
    params: { slug: string }
}
const post = {
    id: 1,
    slug: 'test-abra',
    image: '',
    category: 'tech',
    date: new Date(),
    title: "Title",
    excerpt: "text text",
    content:"text text text text text text",
    author:"Иванов Иван"
};
// Генерация метаданных
export async function generateMetadata({params}: Props): Promise<Metadata> {

    if (!post) {
        return {
            title: 'Пост не найден'
        }
    }

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            images: [post.image || '/default-og.jpg']
        }
    }
}

// Генерация статических путей
export async function generateStaticParams() {
    const posts = [post];

    return posts.map(post => ({
        slug: post.slug
    }))
}

export default async function BlogPostPage({params}: Props) {

    // Если пост не найден - показываем 404
    if (!post) {
        notFound()
    }

    return (
        <Container maxWidth="md" sx={{py: 6}}>
            <Box sx={{mb: 4, textAlign: 'center'}}>
                <Typography variant="h2" component="h1" gutterBottom>
                    {post.title}
                </Typography>
                <Typography variant="subtitle1" color="text.prymary">
                    {new Date(post.date).toLocaleDateString()} • {post.author}
                </Typography>
            </Box>

            {post.image && (
                <Box
                    sx={{
                        height: 400,
                        mb: 4,
                        backgroundImage: `url(${post.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 2
                    }}
                />
            )}

            <Box sx={{typography: 'body1'}}>
                {post.content.split('\n').map((paragraph, index) => (
                    <Typography key={index} paragraph>
                        {paragraph}
                    </Typography>
                ))}
            </Box>
        </Container>
    )
}
