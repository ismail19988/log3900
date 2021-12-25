export interface ITeam  {
    name           :   string,
    owner          :   string,
    password       :   string,
    users          :   Array<ITeamUser>,
    maxUsers       :   number,
    bio            :   string
}

export interface ITeamUser  {
    user           :   string,
    status         :   string
}