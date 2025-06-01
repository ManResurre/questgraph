import React from "react";
import Link from 'next/link';
import {Box, Button, Card, CardContent, Chip, Container, Typography} from '@mui/material';
import {Article, Category} from '@mui/icons-material';
import Grid from '@mui/material/Grid';

export const metadata = {
    title: 'Блог - Моё приложение',
    description: 'Последние статьи и новости в нашем блоге',
};

export default async function BlogPage() {
    const posts = [
        {id: 1, slug: 'test-abra', image: '', category: 'tech', date: new Date(), title: "Title", excerpt: "text text"}
    ];

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Box sx={{textAlign: 'center', mb: 6}}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Блог
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Исследуйте последние статьи и новости
                </Typography>
            </Box>

            {/* Кнопки фильтрации */}
            <Box sx={{display: 'flex', justifyContent: 'center', gap: 2, mb: 4}}>
                <Button variant="contained" startIcon={<Category/>}>
                    Все категории
                </Button>
                <Button variant="outlined">Технологии</Button>
                <Button variant="outlined">Дизайн</Button>
                <Button variant="outlined">Бизнес</Button>
            </Box>

            {/* Список постов */}
            <Grid container spacing={4}>
                {posts.map((post) => (
                    <Grid item key={post.id}>
                        <Link href={`/blog/${post.slug}`} passHref>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6
                                }
                            }}>
                                <Box
                                    sx={{
                                        height: 200,
                                        backgroundImage: `url(${post.image || 'https://placehold.co/600x400'})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                />
                                <CardContent sx={{flexGrow: 1}}>
                                    <Box sx={{display: 'flex', gap: 1, mb: 1}}>
                                        <Chip label={post.category} size="small"/>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(post.date).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h5" component="h3" gutterBottom>
                                        {post.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {post.excerpt}
                                    </Typography>
                                    <Box sx={{display: 'flex', alignItems: 'center', mt: 'auto'}}>
                                        <Article fontSize="small" sx={{mr: 1, color: 'text.secondary'}}/>
                                        <Typography variant="caption">Читать далее</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                ))}
            </Grid>

            {/* Пагинация */}
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 6}}>
                <Button variant="outlined" sx={{mx: 1}} disabled>
                    Назад
                </Button>
                <Button variant="contained" sx={{mx: 1}}>
                    1
                </Button>
                <Button variant="outlined" sx={{mx: 1}}>
                    2
                </Button>
                <Button variant="outlined" sx={{mx: 1}}>
                    3
                </Button>
                <Button variant="outlined" sx={{mx: 1}}>
                    Вперед
                </Button>
            </Box>
        </Container>
    );
}
