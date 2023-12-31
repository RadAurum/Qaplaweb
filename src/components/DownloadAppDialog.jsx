import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Button, Dialog, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CloseIcon } from './../assets/icons/CloseIcon.svg';
import { getRandomDownloadAppGif } from '../services/database';

const CloseButton = styled(IconButton)({
    position: 'absolute',
    top: 16,
    right: 16
});

const GifContainer = styled('img')({
    height: '118px',
    width: '215px',
    objectFit: 'contain'
});

const Title = styled(Typography)({
    marginTop: '32px',
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: -.72,
    textAlign: 'center',
    color: '#FFF'
});

const Description = styled(Typography)({
    marginTop: '32px',
    fontSize: '16px',
    lineHeight: '19.09px',
    letterSpacing: .25,
    textAlign: 'center',
    color: '#FFF'
});

const GoToStreamButton = styled(Button)({
    marginTop: '32px',
    background: '#3B4BF9',
    borderRadius: '40px',
    paddingTop: '26px',
    paddingBottom: '26px',
    textTransform: 'none',
    fontSize: '17px',
    fontWeight: '600',
    letterSpacing: .49,
    color: '#FFF',
    width: '100%',
    '&:hover': {
        opacity: .9,
        background: '#3B4BF9'
    }
});

const DownloadAppDialog = ({ open, onClose, title, description }) => {
    const [gifUrl, setGifUrl] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        async function getGif() {
            const gif = await getRandomDownloadAppGif();
            setGifUrl(gif.val());
        }

        getGif();
    }, []);

    return (
        <Dialog open={open}
            sx={{
                background: 'transparent',
                backdropFilter: 'blur(50px)'
            }}
            PaperProps={{
                style: {
                    backgroundColor: '#141539',
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width:'256px',
                    padding: '56px'
                }
            }}
            onClose={onClose}>
            <CloseButton onClick={onClose}>
                <CloseIcon />
            </CloseButton>
            <GifContainer src={gifUrl} alt='Download app gif' />
            <Title>
                {title}
            </Title>
            <Description>
                {description}
            </Description>
            <GoToStreamButton onClick={() => window.open('https://qapla.app.link/download', '_blank')}>
                {t('DownloadAppDialog.download')}
            </GoToStreamButton>
        </Dialog>
    );
}

export default DownloadAppDialog;