'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {AppBar, Button, Toolbar, Typography} from '@mui/material'

const Navbar = () => {
    const pathname = usePathname()

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{flexGrow: 1}}>
                        Quest Editor
                    </Typography>

                    <Button href="/" variant={pathname === '/' ? 'contained' : 'text'} component={Link}
                            color="inherit">Home</Button>
                    <Button href="/quests" variant={pathname === '/quests' ? 'contained' : 'text'} component={Link}
                            color="inherit">Quests</Button>
                    <Button href="/about" variant={pathname === '/about' ? 'contained' : 'text'} component={Link}
                            color="inherit">About</Button>
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default Navbar
