
export function getRelativeTime(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
    if (diff < 5) return 'now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

export function formatElapsedTime(createdAt) {
    if (!createdAt) return '';
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    if (diff < 0) return '0s';
    if (diff < 60) return `${diff}s`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs < 24) return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
    const days = Math.floor(hrs / 24);
    const remHrs = hrs % 24;
    return remHrs > 0 ? `${days}d ${remHrs}h` : `${days}d`;
}

export function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getOrdinal(day) {
    if (day > 3 && day < 21) return day + 'th';
    switch (day % 10) {
        case 1: return day + 'st';
        case 2: return day + 'nd';
        case 3: return day + 'rd';
        default: return day + 'th';
    }
}

export function splitByStatus(jobs) {
    return {
        queued: jobs.filter((x) => x.status?.toUpperCase() === 'QUEUED'),
        inProgress: jobs.filter(
            (x) =>
                x.status?.toUpperCase() === 'INPROGRESS' ||
                x.status?.toUpperCase() === 'VALIDATING',
        ),
    };
}

export function splitByStatusForHealing(jobs) {
    return {
        queued: jobs.filter((x) => x.status?.toUpperCase() === 'QUEUED'),
        inProgress: jobs.filter(
            (x) =>
                x.status?.toUpperCase() === 'INPROGRESS' ||
                x.status?.toUpperCase() === 'VALIDATING' ||
                x.status?.toUpperCase() === 'HEALING',
        ),
        successorfailed: jobs
            .filter(
                (x) =>
                    x.status?.toUpperCase() === 'AUTO_HEAL_FAILED' ||
                    x.status?.toUpperCase() === 'HEALED' ||
                    x.status?.toUpperCase() === 'PASSED' ||
                    x.status?.toUpperCase() === 'FAILED',
            )
            .sort((a, b) => (b.id || 0) - (a.id || 0)),
    };
}

export function transformTicketData(apiData) {
    return apiData.map((item) => {
        const id = item.ticketId;
        const age = item.elapsedTime.replace(' hrs ', 'h ').replace(' mins', 'm');
        const owner = item.assignedTo
            ?.split('.')[0]
            .replace(/^\w/, (c) => c.toUpperCase());
        const sla = item.slA_Breach === 'YES' ? 'BREACHED' : 'OK';
        const status = item.status;
        const adoTicketId = item.adoTicketNo;
        const ageCls =
            item.priority === 'P1' ? 'crit' : item.priority === 'P2' ? 'warn' : 'ok';

        return {
            id,
            name: item.pipelineName,
            desc: `${item.pipelineName} pipeline alert triggered. Investigation in progress.`,
            prio: item.priority,
            status,
            age,
            ageCls,
            domain: item.domain,
            source: item.pipelineType,
            owner,
            pipeline: item.pipelineName,
            sla,
            rcaCause: item.rootcause,
            adoTicketId,
            slABreach: item.slA_Breach,
            ticketType: item.ticketType,
        };
    });
}

export function getTodayFormatted() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = today.toLocaleString('en-US', { month: 'long' });
    const year = today.getFullYear();
    return `${day} ${month} ${year}`;
}

export function getUsername(email) {
    const userName = email ? email.split('@')[0] : 'firstname.lastname';
    return userName
        .replace('.', ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
