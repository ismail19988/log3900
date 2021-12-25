import Document from 'mongoose'

export interface ITeamDB extends Document  {
    name           :   string,
    owner          :   string,
    password       :   string,
    users          :   Array<string>,
    maxUsers       :   number,
    bio            :   string
}

export interface ITeam  {
    name           :   string,
    owner          :   string,
    password       :   string,
    users          :   Array<string>,
    status         :   Map<string, string>,
    maxUsers       :   number,
    bio            :   string
}