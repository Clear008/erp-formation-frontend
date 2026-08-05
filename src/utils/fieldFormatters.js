export const compactValue = (value = '') => String(value).replace(/\s+/g, '');

export const formatPhone = (value = '') => {
    const raw = String(value).trim();
    if (raw.startsWith('+')) {
        const digits = raw.replace(/\D/g, '').slice(0, 12);
        if (!digits.startsWith('212')) return `+${digits}`;
        const national = digits.slice(3, 12);
        const groups = national ? [national.slice(0, 1), ...national.slice(1).match(/.{1,2}/g) || []] : [];
        return `+212${groups.length ? ` ${groups.join(' ')}` : ''}`;
    }
    return raw.replace(/\D/g, '').slice(0, 10).match(/.{1,2}/g)?.join(' ') || '';
};

export const formatIce = (value = '') =>
    String(value).replace(/\D/g, '').slice(0, 15).match(/.{1,3}/g)?.join(' ') || '';

export const formatIban = (value = '') =>
    compactValue(value).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 34).match(/.{1,4}/g)?.join(' ') || '';

export const formatRib = (value = '') => {
    const digits = String(value).replace(/\D/g, '').slice(0, 24);
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 22), digits.slice(22, 24)]
        .filter(Boolean)
        .join(' ');
};