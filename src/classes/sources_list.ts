/**
 * penguins-eggs
 * name: sources_list.ts
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import chalk from 'chalk'
import Utils from './utils'
import {IMateria} from '../interfaces/index'
import {exec} from '../lib/utils'
import Distro from './distro'

/**
 *
 */
export default class SourcesList {
  /**
    *
    * @param repos
    * @returns
    */
  async distribution(distributions: string[]): Promise<boolean> {
    /**
      * Linuxmint non ha nessuna configurazione in /etc/apt/sources.list
      */
    let checked = true
    checked = false
    const distro = new Distro()

    for (const distribution of distributions) {
      if (distribution.includes(distro.codenameLikeId)) {
        checked = true
      }
    }

    return checked
  }

  /**
    *
    * @param repos
    * @returns
    */
  async components(components: string[]): Promise<boolean> {
    /**
      * Linuxmint non ha nessuna configurazione in /etc/apt/sources.list
      */
    let checked = true
    const repos = await this.get()
    if (repos.length > 0) {
      for (const repo of repos) {
        for (const component of components) {
          // On security we need just main
          if (!repo.includes('security') && !repo.includes(component)) {
            console.log('component: ' + chalk.green(component) + ' is not included in repo: ' + chalk.green(repo))
            checked = false
          }
        }
      }

      if (checked) {
        Utils.warning('repositories checked')
      } else {
        Utils.pressKeyToExit('component warning, check your /etc/apt/sources.list', true)
      }
    }

    return checked
  }

  /**
    *
    */
  private async get(): Promise<string[]> {
    let universalSourcesList = '/etc/apt/sources.list'
    const distro = new Distro()
    if (distro.distroId === 'Linuxmint') {
      universalSourcesList = '/etc/apt/sources.list.d/official-package-repositories.list'
    }

    // deb uri distribution [component1] [component2] [...]
    const checkRepos = await exec(`grep "deb http"<${universalSourcesList}`, {echo: false, capture: true})
    let tmp: string[] = []
    if (checkRepos.code === 0) {
      tmp = checkRepos.data.split('\n')
    }

    // remove empty line
    const repos: string[] = []
    for (const repo of tmp) {
      if (repo !== '') {
        repos.push(repo)
      }
    }

    return repos
  }
}
