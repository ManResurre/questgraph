import React from 'react';
import {
    Box,
    Avatar,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Paper,
    useTheme,
    Tooltip
} from '@mui/material';

const MessageList = ({messages, currentUserId}: any) => {
    const theme = useTheme();

    // Функция для генерации цвета на основе user_id
    const userIdToColor = (userId: any) => {
        const hue = Math.abs(userId % 360);
        return `hsl(${hue}, 70%, 60%)`;
    };

    // Функция для генерации инициалов из user_id
    const userIdToInitials = (userId: any) => {
        const idStr = String(userId);
        if (idStr.length >= 2) {
            return idStr.substring(0, 2);
        }
        return idStr.padStart(2, '0');
    };

    return (
        <List sx={{
            width: '100%',
            bgcolor: 'background.paper',
            p: 0,
            maxHeight: '400px',
            overflowY: 'auto'
        }}>
            {messages.sort((a: any, b: any) => b.time - a.time).map((message: any, index: any) => {
                const isCurrentUser = message.user_id === currentUserId;
                const showAvatar = index === 0 || messages[index - 1].user_id !== message.user_id;
                const isSameUserAsPrevious = index > 0 && messages[index - 1].user_id === message.user_id;

                return (
                    <ListItem
                        key={`${message.user_id}-${index}`}
                        sx={{
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                            alignItems: 'flex-start',
                            py: 0,
                            px: 1,
                            paddingTop: isSameUserAsPrevious ? 0.2 : 1
                        }}
                    >
                        {/* Аватар для других пользователей */}
                        {!isCurrentUser && showAvatar && (
                            <Tooltip title={`User ${message.user_id}`} placement="top" arrow>
                                <ListItemAvatar sx={{
                                    minWidth: 36,
                                    alignSelf: 'flex-start',
                                    mt: '3px'
                                }}>
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: userIdToColor(message.user_id),
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {userIdToInitials(message.user_id)}
                                    </Avatar>
                                </ListItemAvatar>
                            </Tooltip>
                        )}

                        {/* Пустое место вместо аватара при группировке */}
                        {!isCurrentUser && !showAvatar && (
                            <Box sx={{width: 36, mr: 1}}/>
                        )}

                        {/* Контейнер сообщения */}
                        <Box
                            sx={{
                                maxWidth: '80%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                                mx: 1
                            }}
                        >
                            {/* "Пузырек" сообщения */}
                            <Paper
                                elevation={isSameUserAsPrevious ? 0 : 1}
                                sx={{
                                    p: 1.2,
                                    borderRadius: 4,
                                    bgcolor: isCurrentUser
                                        ? theme.palette.primary.main
                                        : theme.palette.grey[200],
                                    color: isCurrentUser
                                        ? theme.palette.primary.contrastText
                                        : 'black',
                                    borderTopLeftRadius: isCurrentUser ? 18 : 2,
                                    borderTopRightRadius: isCurrentUser ? 2 : 18,
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                        bgcolor: isCurrentUser
                                            ? theme.palette.primary.dark
                                            : theme.palette.grey[300]
                                    }
                                }}
                            >
                                <Typography variant="body2">{message.text}</Typography>
                            </Paper>

                            {/* Метаданные под сообщением */}
                            {!isSameUserAsPrevious && (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mt: 0.5,
                                    gap: 0.5
                                }}>
                                    {/* Идентификатор для других пользователей */}
                                    {!isCurrentUser && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{lineHeight: 1}}
                                        >
                                            User {message.user_id}
                                        </Typography>
                                    )}

                                    {/* Разделитель */}
                                    {!isCurrentUser && (
                                        <Typography variant="caption" color="text.secondary">•</Typography>
                                    )}

                                    {/* Время отправки */}
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{lineHeight: 1}}
                                    >
                                        {new Date(message.time).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Аватар для текущего пользователя */}
                        {isCurrentUser && showAvatar && (
                            <Tooltip title="You" placement="top" arrow>
                                <ListItemAvatar sx={{
                                    minWidth: 36,
                                    alignSelf: 'flex-start',
                                    mt: '3px'
                                }}>
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: theme.palette.primary.dark,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {userIdToInitials(currentUserId)}
                                    </Avatar>
                                </ListItemAvatar>
                            </Tooltip>
                        )}

                        {/* Пустое место для аватара текущего пользователя при группировке */}
                        {isCurrentUser && !showAvatar && (
                            <Box sx={{width: 36, ml: 1}}/>
                        )}
                    </ListItem>
                );
            })}
        </List>
    );
};

export default MessageList;
